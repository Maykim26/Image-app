import React, { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";
import MyCropper from "./Crop";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Table from "@mui/joy/Table";
import { styled } from "@mui/material/styles";
import OpenInNew from "@mui/icons-material/OpenInNew";

const initialText = ["", "", "", ""];
const fixedText = ["공사명", "공종", "위치", "내용", "일자"];

const App = () => {
	const [imageName, setImageName] = useState("");
	const [imageSrc, setImageSrc] = useState("");
	const [variant, setVariant] = useState("soft");
	const [inputText, setInputText] = useState(initialText);
	const [textList, setTextList] = useState([]);
	const [isFileSelected, setIsFileSelected] = useState(false);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const fileInputRef = useRef(null);
	const [selectedDate, setSelectedDate] = useState("");

	const canvasContainer = document.createElement("div");
	useEffect(() => {
		const newTextList = inputText.map((text, index) =>
			text.trim() !== "" ? text : ""
		);
		setTextList(newTextList);
	}, [inputText]);

	const handleInputChange = (index, e) => {
		const newText = [...inputText];
		newText[index] = e.target.value;
		setInputText(newText);
	};

	const handleAddText = () => setInputText(initialText);

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImageName(file.name);
			const reader = new FileReader();
			reader.onload = () => setImageSrc(reader.result);
			reader.readAsDataURL(file);
			setIsFileSelected(true);
		} else {
			console.error("No file selected.");
		}
	};

	const handleFileButtonClick = () => fileInputRef.current.click();
	const handleCropComplete = useCallback((croppedAreaPixels) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);
	const handleDownloadImage = async () => {
		console.log("Cropped Area Pixels:", croppedAreaPixels);
		if (!imageSrc || !croppedAreaPixels) {
			console.error(
				"Image source or cropped area pixels not available."
			);
			return;
		}

		const canvasContainer = document.createElement("div");
		canvasContainer.style.display = "flex";
		canvasContainer.style.flexDirection = "column";
		canvasContainer.style.border = "1px solid red";

		const { width, height, x, y } = croppedAreaPixels;

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const MAX_SIZE = 500;
		let newWidth = width;
		let newHeight = height;
		if (width > MAX_SIZE || height > MAX_SIZE) {
			if (width > height) {
				newWidth = MAX_SIZE;
				newHeight = (height / width) * MAX_SIZE;
			} else {
				newHeight = MAX_SIZE;
				newWidth = (width / height) * MAX_SIZE;
			}
		}
		ctx.fillText(selectedDate, 10, 50);

		canvas.width = newWidth;
		canvas.height = newHeight;

		const image = new Image();
		image.onload = async () => {
			ctx.drawImage(
				image,
				x,
				y,
				width,
				height,
				0,
				0,
				newWidth,
				newHeight
			);

			ctx.fillStyle = "white";
			const paddingTop = 8;
			const paddingBottom = 8;

			ctx.fillStyle = "white";
			ctx.fillRect(
				10,
				canvas.height - 110 - paddingTop,
				180,
				74 + paddingTop + paddingBottom
			);
			ctx.font = "10px Arial";
			ctx.fillStyle = "#222";

			fixedText.forEach((text, index) => {
				if (index < 4) {
					const y =
						canvas.height -
						100 +
						index * 18;
					const borderWidth = 2;
					const borderY = y + borderWidth / 2;
					ctx.strokeStyle = "#f1f4f8";
					ctx.lineWidth = borderWidth;

					ctx.beginPath();
					ctx.moveTo(10, borderY);
					ctx.lineTo(190, borderY);
					ctx.stroke();
				}

				const y = canvas.height - 105 + index * 18;
				ctx.fillText(text, 15, y);
			});

			const userTextX = 60;
			ctx.textAlign = "left";
			textList.forEach((text, index) => {
				if (index < 4) {
					const y =
						canvas.height -
						100 +
						index * 18;
					const borderWidth = 2;
					const borderY = y + borderWidth / 2;
					ctx.strokeStyle = "#eee";
					ctx.lineWidth = borderWidth;

					ctx.beginPath();
					ctx.moveTo(userTextX, borderY);
					ctx.lineTo(190, borderY);
					ctx.stroke();
				}

				const y = canvas.height - 105 + index * 18;
				if (text.trim() !== "") {
					ctx.fillText(text, userTextX, y);
				}
			});

			const selectedDateTextY = canvas.height - 105 + 4 * 18;
			ctx.fillText(
				selectedDate,
				userTextX,
				selectedDateTextY
			);

			const imageDataURL = canvas
				.toDataURL("image/png")
				.replace("image/png", "image/octet-stream");
			const downloadLink = document.createElement("a");
			const originalFileName = imageName || "cropped_image";
			downloadLink.href = imageDataURL;
			downloadLink.download = `${originalFileName}`;

			downloadLink.click();

			setTimeout(() => {
				document.body.removeChild(canvasContainer);
			}, 0);
		};

		image.src = imageSrc;
		canvasContainer.appendChild(image);
		document.body.appendChild(canvasContainer);
	};

	const renderTextInputs = () => {
		return fixedText.map((label, index) => (
			<tr key={index}>
				<td>
					<p className="label">{label}</p>
				</td>
				<td>
					{index === fixedText.length - 1 ? ( // 마지막 인덱스인지 확인
						<input
							type="date"
							value={selectedDate}
							onChange={(e) =>
								setSelectedDate(
									e.target
										.value
								)
							}
						/>
					) : (
						// 다른 인덱스에 대한 텍스트 입력 렌더링
						<Input
							size="sm"
							type="text"
							variant="outlined"
							color="primary"
							placeholder="여기에 텍스트 입력"
							value={inputText[index]}
							onChange={(e) =>
								handleInputChange(
									index,
									e
								)
							}
						/>
					)}
				</td>
			</tr>
		));
	};

	const VisuallyHiddenInput = styled("input")({
		clip: "rect(0 0 0 0)",
		clipPath: "inset(50%)",
		height: 1,
		overflow: "hidden",
		position: "absolute",
		bottom: 0,
		left: 0,
		whiteSpace: "nowrap",
		width: 1,
	});

	const renderTextList = () => {
		return fixedText.map((label, index) => (
			<tr key={index}>
				<td className="fixed-text">{label}</td>
				<td className="add-text">{textList[index]}</td>
			</tr>
		));
	};

	return (
		<div className="container">
			<div className="image-upload">
				<h2>ImageApp</h2>

				<div className="mb10">
					<Table
						className="input-table"
						borderAxis="none"
						sx={{
							"--TableCell-paddingY":
								"0px",
						}}
					>
						<tbody>
							{renderTextInputs()}
						</tbody>
					</Table>
				</div>
				<div>
					<input
						type="file"
						ref={fileInputRef}
						style={{ display: "none" }}
						onChange={handleFileChange}
					/>
					<Button
						variant={variant}
						color="primary"
						onClick={handleFileButtonClick}
					>
						Choose File
					</Button>{" "}
					<Button
						className="addBtn"
						onClick={handleAddText}
						variant={variant}
						color="danger"
						disabled={!isFileSelected}
					>
						reset
					</Button>
				</div>
				<div className="fileContainer">
					<div className="buttonContainer">
						<Button
							component="a"
							href="#as-link"
							variant={variant}
							color="success"
							onClick={
								handleDownloadImage
							}
							startDecorator={
								<OpenInNew />
							}
						>
							download
						</Button>
					</div>
				</div>
			</div>
			<div className="image-show">
				<div className="image-container">
					{imageSrc && (
						<div className="img-container">
							<MyCropper
								imageSrc={
									imageSrc
								}
								onCropComplete={
									handleCropComplete
								}
							/>

							<Table
								className="text-table text-overlay"
								size="sm"
								sx={{
									"--TableCell-paddingY":
										"0px",
								}}
							>
								<tbody>
									{renderTextList().slice(
										0,
										-1
									)}
								</tbody>
								<tr>
									<td className="fixed-text">
										일자
									</td>
									<td className="add-text">
										{
											selectedDate
										}
									</td>
								</tr>
							</Table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default App;
