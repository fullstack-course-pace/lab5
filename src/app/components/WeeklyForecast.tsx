"use client";

import {
  Card,
  CardContent,
  Typography,
  Paper,
  Box,
  Chip,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { Place } from "./CitySearch";

type DailyForecast = {
  time: string[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_sum?: number[];
  precipitation_probability_max?: number[];
  wind_speed_10m_max?: number[];
};

type ForecastResponse = {
  daily?: DailyForecast;
  timezone?: string;
};

async function fetchWeeklyForecast(p: Place): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(p.latitude),
    longitude: String(p.longitude),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch weekly forecast.");
  return (await res.json()) as ForecastResponse;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function WeeklyForecast({ place }: { place?: Place }) {
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["weekly-forecast", place?.latitude, place?.longitude],
    queryFn: () => fetchWeeklyForecast(place!),
    enabled: !!place,
    staleTime: 60_000,
    retry: 1,
  });

  if (!place) {
    return (
      <Card sx={{ maxWidth: 800, m: "16px auto" }}>
        <CardContent>
          <Typography>Select a city to see the 7-day forecast.</Typography>
        </CardContent>
      </Card>
    );
  }

  if (isFetching) {
    return (
      <Card sx={{ maxWidth: 800, m: "16px auto" }}>
        <CardContent>
          <Typography>Loading 7-day forecast for {place.name}…</Typography>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card sx={{ maxWidth: 800, m: "16px auto" }}>
        <CardContent>
          <Typography color="error">{(error as Error).message}</Typography>
        </CardContent>
      </Card>
    );
  }

  const daily = data?.daily;
  const days = daily?.time?.length ?? 0;

  return (
    <Card sx={{ maxWidth: 800, m: "16px auto" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          7-Day Forecast — {place.name}
          {place.country ? `, ${place.country}` : ""}
        </Typography>

        {!daily || days === 0 ? (
          <Typography>No forecast data available.</Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: 2,
              mt: 1,
            }}
          >
            {daily.time.map((dateStr, idx) => (
              <Paper elevation={2} sx={{ p: 2, height: "100%" }} key={dateStr}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {formatDate(dateStr)}
                </Typography>
                <Typography color="error.main">
                  High: {daily.temperature_2m_max?.[idx] ?? "—"}°C
                </Typography>
                <Typography color="primary.main">
                  Low: {daily.temperature_2m_min?.[idx] ?? "—"}°C
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Precipitation: {daily.precipitation_sum?.[idx] ?? 0} mm
                </Typography>
                {daily.precipitation_probability_max?.[idx] != null && (
                  <Chip
                    label={`${daily.precipitation_probability_max[idx]}% chance`}
                    size="small"
                    color={
                      daily.precipitation_probability_max[idx] > 50 ? "warning" : "default"
                    }
                    sx={{ mb: 0.5 }}
                  />
                )}
                <Typography variant="body2">
                  Max Wind: {daily.wind_speed_10m_max?.[idx] ?? "—"} m/s
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
