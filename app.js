const express = require("express") // Web Framework 로드 : 웹 서버 기초 환경
const session = require("express-session") // Session MiddleWare 로드 : 페이지 바껴도 사용자 기억
const qs = require("qs") // Query String Parser(쿼리 문자열 파서) : 데이터 형태 변환 ex) '이름:HB 나이:__'
const axios = require("axios") // HTTP Client : 서버에서 카카오 서버에 데이터 요청
const app = express() // Express Instance 생성 : 서버 본체 생성
const port = 4000 // Port Number 할당 : 외부 사용자 접속 통로 지정

// MiddleWare Setup: 정적 파일 서빙 설정 (요청 -> 기능 실행 전 거치는 필터)
app.use(express.static(__dirname)) // Static File Serving : HTML, IMG 파일 등 자동 응답
app.use(express.json()) // Boday Parser-JSON 형식 : 서버가 데이터 읽을 수 있게 객체로 해석

// Session Configuration : 로그인 상태 유지 위한 세션 (사용자 구별,보안 규칙)
app.use(
    session({
        seret: "your session secret", // 세션 암호화 키 : 서버 기록 암호
        resave: false, // 세션 재저장 옵션 : 데이터 중복 저장 방지
        saveUninitialized: true, // 미초기화 세션 저장 옵션 : 사용자의 empty 장부 미리 생성
        cookie: { secure: false}, // 쿠키 보안 옵션 : 전송 방식 보안(HTTPS 없어도 기록 교환 허용)
    })
)