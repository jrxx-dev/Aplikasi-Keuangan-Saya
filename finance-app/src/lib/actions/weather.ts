"use server";

interface WeatherData {
    temp: number;
    weather: string;
    weatherCode: string;
    location: string;
}

// Map OpenMeteo codes to BMKG-like descriptions for consistency
const OPENMETEO_CODES: Record<string, string> = {
    "0": "Cerah", "1": "Cerah", "2": "Cerah Berawan", "3": "Berawan",
    "45": "Kabut", "48": "Kabut", "51": "Gerimis", "53": "Gerimis", "55": "Gerimis",
    "61": "Hujan Ringan", "63": "Hujan Sedang", "65": "Hujan Lebat",
    "80": "Hujan", "81": "Hujan", "82": "Hujan Lebat",
    "95": "Hujan Petir", "96": "Hujan Petir", "99": "Hujan Petir"
};

export async function getBMKGWeather(): Promise<WeatherData | null> {
    try {
        // Default Jakarta Pusat (Gambir)
        const adm4 = "31.71.03.1001";
        const response = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`, {
            next: { revalidate: 1800 } // 30 mins
        });

        if (!response.ok) throw new Error(`BMKG Fetch Failed: ${response.status}`);

        const json = await response.json();
        const cuacaList = json?.data?.[0]?.cuaca;

        if (!cuacaList || !Array.isArray(cuacaList)) throw new Error("Invalid BMKG Data Structure");

        // Find closest time
        // BMKG local_datetime is typically WIB (UTC+7) formatted as "YYYY-MM-DD HH:mm:ss"
        // We need to compare it with current time in WIB.

        const now = new Date();
        // Convert current server "now" to WIB timestamp approx (UTC+7)
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const nowWIB = new Date(utc + (3600000 * 7));

        let closest = cuacaList[0];
        let minDiff = Infinity;

        for (const c of cuacaList) {
            // Parse BMKG string simply without timezone to avoid browser/node interpretation quirks
            // string: "2024-12-25 12:00:00"
            // We treat this string as if it's already in the same timeframe as nowWIB
            const t = c.local_datetime.split(/[- :]/);
            // Apply Month - 1 because JS months are 0-indexed
            const dataTime = new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]);

            const diff = Math.abs(nowWIB.getTime() - dataTime.getTime());
            if (diff < minDiff) {
                minDiff = diff;
                closest = c;
            }
        }

        // BMKG weather_desc is already readable "Berawan", "Hujan Ringan", etc.
        // Convert to code for icon mapping logic if needed, or mapping reverse.
        // For DashboardHeader, we use bmkg code or descriptions.
        // Let's pass description directly and try to map simple codes for icons.

        // Pseudo code mapping for icons based on description text since API doesn't give simple codes like '60' directly clearly in new JSON?
        // Wait, old XML had codes. New JSON has 'weather_desc'.
        // Let's allow 'weather' to be the description. 'weatherCode' logic needs to adapt.
        // We can map description -> simple code for frontend Icon.

        let code = "0"; // default cerah
        const desc = closest.weather_desc.toLowerCase();

        if (desc.includes("cerah")) code = "0";
        if (desc.includes("berawan")) code = "3";
        if (desc.includes("hujan")) code = "60";
        if (desc.includes("petir")) code = "95";
        if (desc.includes("kabut") || desc.includes("asap")) code = "45";

        return {
            temp: closest.t,
            weather: closest.weather_desc,
            weatherCode: code,
            location: "Jakarta Pusat"
        };

    } catch (e) {
        // Silent Fallback to OpenMeteo (Jakarta Coordinates)
        // console.warn("BMKG API unstable, falling back to OpenMeteo:", e);
        // Monas Coordinates: -6.1754, 106.8272
        return await getWeatherByCoordinates(-6.1754, 106.8272);
    }
}

// Fallback / Geolocation Support using OpenMeteo (Most reliable for lat/lon without key)
export async function getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`, {
            next: { revalidate: 900 }
        });

        if (!res.ok) throw new Error("OpenMeteo Fetch Failed");
        const data = await res.json();
        const current = data.current;

        const wCode = String(current.weather_code);
        const wDesc = OPENMETEO_CODES[wCode] || "Cerah";

        // Get Location Name via Reverse Geocoding (OSM Nominatim)
        // Attempt to match administrative area names similar to BMKG (Kelurahan/Kecamatan)
        let locName = "Lokasi Pengguna";
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`, {
                headers: { 'User-Agent': 'FinanceMyDashboard/1.0' } // Good practice
            });

            if (geoRes.ok) {
                const geoData = await geoRes.json();
                const addr = geoData.address;

                if (addr) {
                    // Priority: Village (Kelurahan) -> Suburb (Kecamatan/Kelurahan) -> Town -> City District
                    const specific = addr.village || addr.suburb || addr.neighbourhood;
                    const district = addr.city_district || addr.county || addr.city;

                    if (specific && district) {
                        locName = `${specific}, ${district}`;
                    } else if (specific) {
                        locName = specific;
                    } else if (district) {
                        locName = district;
                    } else {
                        locName = geoData.display_name.split(',')[0];
                    }
                }
            }
        } catch (e) {
            console.error("Reverse Geo Error:", e);
        }

        return {
            temp: Math.round(current.temperature_2m),
            weather: wDesc,
            weatherCode: wCode,
            location: locName // Returns e.g. "Gambir, Jakarta Pusat"
        };

    } catch (e) {
        console.error("Fetch Coords Weather Error:", e);
        return null;
    }
}
