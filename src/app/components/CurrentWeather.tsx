"use client";

import { Card, CardContent, Typography, Stack, Divider } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { Place } from "./CitySearch"; // reuse the type you already export

type CurrentResponse = {
  current?: {
    time: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    wind_speed_10m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
  };
  timezone?: string;
};

async function fetchCurrentWeather(p: Place): Promise<CurrentResponse> {
  const params = new URLSearchParams({
    latitude: String(p.latitude),
    longitude: String(p.longitude),
    // Request only what we show to keep payload small
    current: [
      "temperature_2m",
      "apparent_temperature",
      "wind_speed_10m",
      "relative_humidity_2m",
      "precipitation",
    ].join(","),
    timezone: "auto",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch current weather.");
  return (await res.json()) as CurrentResponse;
}

export default function CurrentWeather({ place }: { place?: Place }) {
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["current-weather", place?.latitude, place?.longitude],
    queryFn: () => fetchCurrentWeather(place!),
    enabled: !!place, // only run after a city is selected
    staleTime: 60_000, // 1 minute
    retry: 1,
  });

  if (!place) {
    return (
      <Card sx={{ maxWidth: 800, m: "16px auto" }}>
        <CardContent>
          <Typography>Select a city to see current weather.</Typography>
        </CardContent>
      </Card>
    );
  }

  if (isFetching) {
    return (
      <Card sx={{ maxWidth: 800, m: "16px auto" }}>
        <CardContent>
          <Typography>Loading current weather for {place.name}…</Typography>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card sx={{ maxWidth: 800, m: "16px auto" }}>
        <CardContent>
          <Typography color="error">
            {(error as Error).message}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const c = data?.current;
  return (
    <Card sx={{ maxWidth: 800, m: "16px auto" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Current Weather — {place.name}
          {place.country ? `, ${place.country}` : ""}
        </Typography>

        {!c ? (
          <Typography>No current data available.</Typography>
        ) : (
          <Stack spacing={1} divider={<Divider flexItem />}>
            <Typography>
              Observed at: {c.time} {data?.timezone ? `(${data.timezone})` : ""}
            </Typography>
            <Typography>
              Temperature: {c.temperature_2m ?? "—"} °C
              {c.apparent_temperature != null
                ? ` (feels like ${c.apparent_temperature} °C)`
                : ""}
            </Typography>
            <Typography>
              Humidity: {c.relative_humidity_2m != null ? `${c.relative_humidity_2m}%` : "—"}
            </Typography>
            <Typography>
              Wind: {c.wind_speed_10m != null ? `${c.wind_speed_10m} m/s` : "—"}
            </Typography>
            <Typography>
              Precipitation: {c.precipitation != null ? `${c.precipitation} mm` : "—"}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
