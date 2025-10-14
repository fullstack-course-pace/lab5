"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Box,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

export type Place = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
};

type GeoResult = {
  id?: number;
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
};

async function geocode(name: string): Promise<Place[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name
  )}&count=5`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to search cities. Try again.");
  const data = await res.json();
  const items: GeoResult[] = (data?.results ?? []) as GeoResult[];
  return items.map((r) => ({
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export default function CitySearch({ onSelect }: { onSelect: (p: Place) => void }) {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState(""); // last submitted query

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["geocode", submitted],
    queryFn: () => geocode(submitted),
    enabled: submitted.length > 0, // runs after submit
    staleTime: 60_000,
    retry: 1,
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();                 // stop page reload
    const term = q.trim();
    if (!term) return;
    setSubmitted(term);                 // triggers the query
  }

  return (
    <Card sx={{ maxWidth: 800, m: "24px auto" }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Pick a City
        </Typography>

        <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Search city"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            // Force label to float to avoid any overlap in some browsers/themes
            InputLabelProps={{ shrink: q.length > 0 }}
            inputProps={{ "aria-label": "Search city" }}
          />
          <Button type="submit" variant="contained" disabled={isFetching}>
            {isFetching ? "Searching..." : "Search"}
          </Button>
        </Box>

        {isError && (
          <Typography color="error" sx={{ mt: 1 }}>
            {(error as Error).message}
          </Typography>
        )}

        {!isFetching && submitted && (!data || data.length === 0) && (
          <Typography sx={{ mt: 1 }}>No results.</Typography>
        )}

        <List aria-label="Search results">
          {(data ?? []).map((p, idx) => {
            const key = `${p.name}-${p.country ?? "NA"}-${p.latitude}-${p.longitude}-${idx}`;
            return (
              <ListItem key={key} disablePadding>
                <ListItemButton onClick={() => onSelect(p)}>
                  {p.name}
                  {p.country ? `, ${p.country}` : ""} ({p.latitude.toFixed(2)}, {p.longitude.toFixed(2)})
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}
