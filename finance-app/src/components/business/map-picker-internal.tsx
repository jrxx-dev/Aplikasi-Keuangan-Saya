'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
// Fix for default marker icons in Leaflet with Next.js
import L from 'leaflet';

const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Components definition
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl } from 'react-leaflet';

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={icon}></Marker>
    );
}

const MapPickerInternal = ({ value, onChange }: { value?: string, onChange: (val: string) => void }) => {
    // Default to Mukomuko or somewhere relevant if no value
    const defaultCenter: [number, number] = [-2.576, 101.118]; // Approximate Mukomuko

    // Parse initial value "lat,lng"
    const initialPos = useMemo(() => {
        if (!value) return null;
        const [lat, lng] = value.split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) return null;
        return new L.LatLng(lat, lng);
    }, [value]);

    const [position, setPosition] = useState<L.LatLng | null>(initialPos);

    useEffect(() => {
        if (position) {
            onChange(`${position.lat},${position.lng}`);
        }
    }, [position, onChange]);

    return (
        <MapContainer center={initialPos || defaultCenter} zoom={13} style={{ height: '300px', width: '100%', borderRadius: '0.5rem' }}>
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Street Map">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
            <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
    );
};

export default MapPickerInternal;
