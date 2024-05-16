const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

// 이미지 파일의 경로
const imagePath = path.join(__dirname, "uploads", "image.jpg");
// 텍스트 파일의 경로
const textPath = path.join(__dirname, "uploads", "text.txt");

// 이미지와 텍스트 파일 다운로드 엔드포인트
app.get("/download", (req, res) => {
    try {
        // 이미지 파일 읽기
        const imageData = fs.readFileSync(imagePath);
        // 텍스트 파일 읽기
        const textData = fs.readFileSync(textPath, "utf-8");

        // 클라이언트에 응답으로 데이터 전송
        res.json({
            imageUrl: "/download/image",
            text: textData,
        });
    } catch (error) {
        console.error("Error occurred while downloading data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 이미지 파일 다운로드 엔드포인트
app.get("/download/image", (req, res) => {
    res.download(imagePath, "image.jpg");
});

app.listen(4000, () => {
    console.log("Server is running on port 4000");
});
