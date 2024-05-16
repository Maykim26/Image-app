import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Table from "@mui/joy/Table";

const initialText = ["", "", "", "", ""];
const fixedText = ["공사명", "공종", "위치", "내용", "일자"];

const App = () => {
    const [imageName, setImageName] = useState("");
    const [imageSrc, setImageSrc] = useState("");
    const [inputText, setInputText] = useState(initialText);
    const [textList, setTextList] = useState([]);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const handleDownloadImage = () => {
        // 캔버스와 이미지 텍스트를 감싸는 부분에 스타일 적용
        const canvasContainer = document.createElement("div");
        canvasContainer.style.display = "flex";
        canvasContainer.style.flexDirection = "column";

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const image = new Image();

        image.onload = () => {
            const originalWidth = image.width;
            const originalHeight = image.height;
            const minSize = Math.min(originalWidth, originalHeight); // 이미지의 가로 또는 세로 중 작은 값

            canvas.width = minSize; // 가로와 세로 크기를 최소값으로 설정하여 1:1 비율로 자르기 위함
            canvas.height = minSize;

            // 이미지를 캔버스에 그리기
            ctx.drawImage(image, 0, 0, minSize, minSize);

            ctx.fillStyle = "white";
            ctx.fillRect(10, canvas.height - 110, 200, 100);

            // 고정된 텍스트 그리기 (왼쪽)
            ctx.font = "16px Arial";
            ctx.fillStyle = "#222";

            fixedText.forEach((text, index) => {
                const y = canvas.height - 95 + index * 20; // 텍스트 줄 간격을 고려하여 y 좌표를 계산합니다.
                ctx.fillText(text, 10, y);
            });

            const userTextX = 110; // 사용자가 추가한 텍스트 시작 위치 (오른쪽)
            ctx.textAlign = "left"; // 텍스트를 오른쪽으로 정렬합니다.
            textList.forEach((text, index) => {
                const y = canvas.height - 95 + index * 20; // 텍스트 줄 간격을 고려하여 y 좌표를 계산합니다.
                if (text.trim() !== "") {
                    ctx.fillText(text, userTextX, y); // 빈 문자열이 아닌 경우에만 텍스트를 그립니다.
                }
            });

            // 이미지 다운로드
            const imageDataURL = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            const downloadLink = document.createElement("a");
            // 원본 이미지 파일의 이름으로 다운로드 링크의 파일 이름 설정
            const originalFileName = imageName || "image"; // imageName이 없으면 "image"로 설정
            downloadLink.href = imageDataURL;
            downloadLink.download = `${originalFileName}`; // 파일 확장자를 항상 png로 설정
            canvasContainer.appendChild(canvas); // 캔버스를 캔버스 컨테이너에 추가합니다.

            // 이미지 다운로드 후에는 캔버스와 캔버스 컨테이너를 삭제합니다.
            downloadLink.addEventListener("click", () => {
                setTimeout(() => {
                    document.body.removeChild(canvasContainer);
                }, 0);
            });

            downloadLink.click();
        };

        image.src = imageSrc;
        canvasContainer.appendChild(image); // 이미지를 캔버스 컨테이너에 추가합니다.
        document.body.appendChild(canvasContainer);
    };

    const renderTextInputs = () => {
        return fixedText.map((label, index) => (
            <tr key={index}>
                <td>
                    <p className="label">{label}</p>
                </td>
                <td>
                    <Input
                        size="sm"
                        type="text"
                        variant="outlined"
                        color="primary"
                        placeholder="Enter text here"
                        value={inputText[index]}
                        onChange={(e) => handleInputChange(index, e)}
                        disabled={!isFileSelected}
                    />
                </td>
            </tr>
        ));
    };

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
                <div className="mb10">
                    <Table
                        className="input-table"
                        borderAxis="none"
                        sx={{
                            "--TableCell-paddingY": "0px",
                        }}>
                        <tbody>{renderTextInputs()}</tbody>
                    </Table>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                    <Button variant="soft" onClick={handleFileButtonClick}>
                        Choose File
                    </Button>{" "}
                    <Button
                        className="addBtn"
                        onClick={handleAddText}
                        disabled={!isFileSelected}>
                        reset
                    </Button>
                </div>
            </div>
            <div className="image-show">
                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                <div className="image-container">
                    {imageSrc && (
                        <div className="img-container">
                            <img
                                className="img"
                                src={imageSrc}
                                alt="Uploaded"
                            />
                            <Table
                                className="text-table text-overlay"
                                size="sm"
                                sx={{
                                    "--TableCell-paddingY": "0px",
                                }}>
                                <tbody>{renderTextList()}</tbody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
            <div className="fileContainer">
                <div className="fileInput">
                    <p id="fileName">{imageName}</p>
                </div>
                <div className="buttonContainer">
                    <Button onClick={handleDownloadImage}>Download1🙂</Button>
                </div>
            </div>
        </div>
    );
};

export default App;
