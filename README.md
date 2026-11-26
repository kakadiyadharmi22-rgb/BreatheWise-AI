# BreatheWise AI — Urban Air Quality Assistant

A lightweight, responsive web application for exploring current air-quality readings and understanding common pollutants.

## Features
- Current US AQI reading for a default city (Ahmedabad)
- Search for cities worldwide
- PM2.5, PM10, nitrogen dioxide, ozone, sulphur dioxide and carbon monoxide readings
- AQI-based general health guidance
- Responsive desktop and mobile layout

## Run locally
1. Download or clone this repository.
2. Open `index.html` in a modern browser, or run it through a local web server.
3. An internet connection is required for live data.

## Data source
- Open-Meteo Geocoding API: https://geocoding-api.open-meteo.com/
- Open-Meteo Air Quality API: https://air-quality-api.open-meteo.com/

The app makes requests directly from the browser and does not require an API key. Availability and update frequency depend on the data provider.

## Important health note
This project is an educational information tool, not a medical device. It does not replace official government air-quality advisories or advice from a healthcare professional. The displayed AQI uses the provider's US AQI field; local authorities may use a different AQI scale.

## AI integration status
This starter version uses transparent AQI threshold rules to generate general guidance. It does not yet call a generative AI service. A Gemini integration can be added in a later version using a secure backend so that API keys are not exposed in public frontend code.
