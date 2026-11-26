// BreatheWise AI - live air-quality data powered by Open-Meteo (no API key required).
const $ = (id) => document.getElementById(id);
const DEFAULT_CITY = {name:"Ahmedabad", country:"India", latitude:23.0225, longitude:72.5714};

function setStatus(message, error=false) {
  $("status").textContent = message;
  $("status").className = error ? "status error" : "status";
}
function number(value, digits=1) {
  return value === null || value === undefined || !Number.isFinite(Number(value)) ? "—" : Number(value).toFixed(digits);
}
function classifyAQI(aqi) {
  if (aqi <= 50) return {label:"Good", color:"#159b8b", advice:"Air quality is considered satisfactory. Enjoy normal outdoor activities while staying aware of local conditions."};
  if (aqi <= 100) return {label:"Moderate", color:"#b69a24", advice:"Air quality is acceptable for most people. Unusually sensitive people may want to reduce prolonged, heavy outdoor exertion."};
  if (aqi <= 150) return {label:"Unhealthy for sensitive groups", color:"#d88936", advice:"Sensitive groups, including some people with heart or lung conditions, may experience effects. Consider reducing prolonged outdoor exertion."};
  if (aqi <= 200) return {label:"Unhealthy", color:"#c95d56", advice:"Some people may experience health effects. Consider limiting prolonged outdoor exertion and follow local health advice."};
  if (aqi <= 300) return {label:"Very unhealthy", color:"#9563a6", advice:"Health alert: everyone may experience health effects. Consider avoiding prolonged outdoor exertion and follow official advisories."};
  return {label:"Hazardous", color:"#8d3e54", advice:"Health warning: everyone may be at greater risk. Avoid outdoor exertion where possible and follow official emergency guidance."};
}
function updateGuidance(aqi, details) {
  const title = $("guidanceTitle"), text = $("guidanceText"), list = $("guidanceList");
  let tips;
  if (aqi <= 50) {
    title.textContent = "A good-air day";
    text.textContent = "The current reading is in the Good range. Conditions are generally suitable for outdoor plans.";
    tips = ["Enjoy outdoor walks and activities as usual.", "Keep checking local updates because conditions can change.", "People with health concerns should follow their usual care advice."];
  } else if (aqi <= 100) {
    title.textContent = "A mostly comfortable day";
    text.textContent = "Air quality is Moderate. Most people can continue normal activities, while unusually sensitive people should pay attention to symptoms.";
    tips = ["Sensitive individuals may choose lighter or shorter outdoor exercise.", "Consider moving strenuous exercise away from busy roads.", "Check the AQI again later in the day."];
  } else if (aqi <= 150) {
    title.textContent = "Take a little extra care";
    text.textContent = "The reading may affect sensitive groups more noticeably. Use the guidance below as a general precaution.";
    tips = ["People with asthma or heart/lung conditions should follow their care plan.", "Reduce prolonged or heavy outdoor exertion if you are sensitive.", "Consider indoor alternatives for strenuous exercise."];
  } else {
    title.textContent = "Prioritize cleaner-air choices";
    text.textContent = "The current AQI is elevated. Consider reducing time and exertion outdoors and follow local public-health advisories.";
    tips = ["Avoid strenuous outdoor activity where possible.", "Keep windows closed when outdoor air is poor, if indoor air is cleaner.", "Follow official local advisories; seek medical help for severe symptoms."];
  }
  list.innerHTML = "";
  tips.forEach(t => { const li=document.createElement("li"); li.textContent=t; list.appendChild(li); });
}
async function loadAir(city) {
  setStatus("Fetching the latest available air-quality reading…");
  $("locationName").textContent = city.name + (city.country ? ", " + city.country : "");
  const fields = "us_aqi,european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide";
  const url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" +
    encodeURIComponent(city.latitude) + "&longitude=" + encodeURIComponent(city.longitude) +
    "&current=" + fields + "&timezone=auto";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Air-quality service returned an error (" + response.status + ").");
    const data = await response.json();
    if (!data.current) throw new Error("No current reading is available for this location.");
    const c = data.current, aqi = Number(c.us_aqi);
    $("aqiNumber").textContent = Number.isFinite(aqi) ? Math.round(aqi) : "—";
    const status = classifyAQI(Number.isFinite(aqi) ? aqi : 0);
    $("aqiLabel").textContent = Number.isFinite(aqi) ? status.label : "Unavailable";
    $("aqiLabel").style.color = status.color;
    $("aqiLabel").style.background = status.color + "18";
    $("aqiNumber").style.color = status.color;
    $("aqiAdvice").textContent = Number.isFinite(aqi) ? status.advice : "The provider did not return a US AQI value.";
    const marker = Math.max(1, Math.min(99, (aqi / 300) * 100));
    $("scaleMarker").style.left = marker + "%";
    $("pm25").textContent=number(c.pm2_5); $("pm10").textContent=number(c.pm10);
    $("no2").textContent=number(c.nitrogen_dioxide); $("o3").textContent=number(c.ozone);
    $("so2").textContent=number(c.sulphur_dioxide); $("co").textContent=number(c.carbon_monoxide);
    $("updatedAt").textContent = c.time ? "Updated " + c.time.replace("T"," ") : "Latest reading";
    if (Number.isFinite(aqi)) updateGuidance(aqi, c);
    setStatus("Data loaded successfully. Source: Open-Meteo Air Quality API.");
  } catch (err) {
    setStatus(err.message + " Check your internet connection and try again.", true);
    $("aqiLabel").textContent="Data unavailable";
    $("aqiAdvice").textContent="We couldn't retrieve a current reading. Please try again later.";
    $("guidanceTitle").textContent="Live guidance is unavailable";
    $("guidanceText").textContent="The air-quality provider could not be reached. Check official local air-quality information before making outdoor plans.";
  }
}
async function searchCity(name) {
  if (!name.trim()) { setStatus("Please enter a city name.", true); return; }
  setStatus("Finding " + name + "…");
  try {
    const url="https://geocoding-api.open-meteo.com/v1/search?name="+encodeURIComponent(name.trim())+"&count=1&language=en&format=json";
    const response=await fetch(url);
    if(!response.ok) throw new Error("City search is temporarily unavailable.");
    const data=await response.json();
    if(!data.results || !data.results.length) throw new Error("City not found. Try another spelling.");
    const place=data.results[0];
    await loadAir({name:place.name,country:place.country,latitude:place.latitude,longitude:place.longitude});
  } catch(err) { setStatus(err.message,true); }
}
$("searchForm").addEventListener("submit",function(event){event.preventDefault();searchCity($("cityInput").value);});
$("year").textContent=new Date().getFullYear();
loadAir(DEFAULT_CITY);
