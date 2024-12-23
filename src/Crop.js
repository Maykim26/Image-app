import React, { useState, useCallback } from "react";
import "./App.css";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";

const MyCropper = ({ imageSrc, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const handleCropComplete = useCallback(
        (croppedArea, croppedAreaPixels) => {
            onCropComplete(croppedAreaPixels); // Ensure to send croppedAreaPixels
        },
        [onCropComplete]
    );

    return (
        <div className="image-show">
            <div className="img-container">
                <Cropper
                    className="img"
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={handleCropComplete}
                    onZoomChange={setZoom}
                />
                <Slider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e, zoom) => setZoom(zoom)}
                    sx={{ width: "100%" }}
                />
            </div>
        </div>
    );
};

export default MyCropper;
