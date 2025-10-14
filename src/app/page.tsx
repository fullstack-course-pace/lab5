"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Place } from "./components/CitySearch";

const CitySearch = dynamic(() => import("./components/CitySearch"));
const CurrentWeather = dynamic(() => import("./components/CurrentWeather"));

export default function Page() {
  const [selected, setSelected] = useState<Place | undefined>(undefined);

  return (
    <div>
      <CitySearch onSelect={(p) => setSelected(p)} />
      <CurrentWeather place={selected} />
    </div>
  );
}
