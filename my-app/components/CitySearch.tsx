"use client";
import { useState } from "react";
import { TextField, Button, Card, CardContent, List, ListItem } from "@mui/material";
import { fetchJson } from "../lib/weather";

type Place = { name: string; country?: string; latitude: number; longitude: number };

export default function CitySearch({ onSelect }: { onSelect: (p: Place) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5`;
      const data = await fetchJson<{ results?: any[] }>(url);
      setResults((data.results || []).map(r => ({
        name: r.name, country: r.country, latitude: r.latitude, longitude: r.longitude
      })));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card sx={{ maxWidth: 800, m: "24px auto" }}>
      <CardContent>
        <h2>Pick a City</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <TextField size="small" label="Search city" value={q} onChange={e => setQ(e.target.value)} />
          <Button variant="contained" onClick={search} disabled={loading}>{loading ? "Searching..." : "Search"}</Button>
        </div>
        <List>
          {results.map((p, i) => (
            <ListItem key={i} button onClick={() => onSelect(p)}>
              {p.name}{p.country ? `, ${p.country}` : ""} — ({p.latitude.toFixed(2)}, {p.longitude.toFixed(2)})
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
