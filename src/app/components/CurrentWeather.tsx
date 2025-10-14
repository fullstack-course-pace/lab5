"use client";

import { useEffect, useState } from "react";
import type { Place } from "./CitySearch";

type Weather = {
	temperature: number | null;
	windspeed: number | null;
	weathercode: number | null;
};

export default function CurrentWeather({ place }: { place?: Place }) {
	const [weather, setWeather] = useState<Weather>({ temperature: null, windspeed: null, weathercode: null });
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!place) return;
		const abort = new AbortController();
		setLoading(true);
		const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current_weather=true`;
		fetch(url, { signal: abort.signal })
			.then(r => r.json())
			.then(d => {
				const cur = d.current_weather || {};
				setWeather({ temperature: cur.temperature ?? null, windspeed: cur.windspeed ?? null, weathercode: cur.weathercode ?? null });
			})
			.catch(() => {})
			.finally(() => setLoading(false));

		return () => abort.abort();
	}, [place]);

	if (!place) return <div style={{ textAlign: "center", marginTop: 24 }}>Select a city to see current weather.</div>;

	return (
		<div style={{ maxWidth: 800, margin: "24px auto", padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
			<h3>Current weather in {place.name}{place.country ? `, ${place.country}` : ''}</h3>
			{loading ? (
				<p>Loading...</p>
			) : (
				<ul>
					<li>Temperature: {weather.temperature !== null ? `${weather.temperature}°C` : '—'}</li>
					<li>Windspeed: {weather.windspeed !== null ? `${weather.windspeed} m/s` : '—'}</li>
					<li>Weather code: {weather.weathercode ?? '—'}</li>
				</ul>
			)}
		</div>
	);
}
