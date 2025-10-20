"use client";
import CitySearch from "./components/CitySearch";
import CurrentWeather from "./components/CurrentWeather";
import WeeklyForecast from "./components/WeeklyForecast";
import { useState } from "react";
import type { Place } from "./components/CitySearch";

export default function Page() {
  const [selected, setSelected] = useState<Place | undefined>(undefined);

  return (
    <div>
      <CitySearch onSelect={setSelected} />
      <CurrentWeather place={selected} />
      <WeeklyForecast place={selected} />
    </div>
  );
}
