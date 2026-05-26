import React, { useState } from 'react';
import "./SongSearch.css";
import searchIcon from "../assets/magnifyingglass.png";

export default function SongSearch() {
    // 사용자의 검색 키워드 저장
    const [keyword, setKeyword] = useState('');

    // API 응답으로 받은 검색 결과 저장 : 검색 후 결과 화면에 표시하기 위함
    const [searchResults, setSearchResults] = useState([]);

    // 로딩 중 여부 : API 호출 시 로딩중 메세지 or 스피너 표시
    const [isLoading, setIsLoading] = useState(false);

    // 에러 메세지(검색 실패 시 사용자에 알림)
    const [error, setError] = useState(null);

    // 검색 결과 개수 제한 (기본값 10)
    const [limit, setLimit] = useState(10);

    // 입력창 값 변할 때 실행 for 입력마다 상태 업데이트
    const handleInputChange = (event) => {
        // event: 함수 실행 시 외부에서 들어오는 데이터(매개변수)
        setKeyword(event.target.value);
        // 입력창 값을 keyword에 저장
        {/* # 웹의 표준 API 속성명
            event : 브라우저에서 이벤트(키보드,마우스) 시 생기는 '상태 정보 데이터 객체'
            target : event 내부 속성 - '이벤트 발생 최초 진원지'(특정 HTML요소)
            value : HTML 요소의 '표준 입력 속성'(최신 텍스트값)
        */}
    };

    // API 호출
    const searchTracks = async () => {

        // 검색어 없으면 알림 띄우고 함수 종료
        if (!keyword.trim()) {
            alert('검색어를 입력해주세요.');
            return;
        }

        // API 호출 시작 : 로딩 상태 true로 변경
        setIsLoading(true);

        // 기존 에러 메세지 삭제(새 검색 시 이전 에러 남지 않게)
        setError(null);

        try {

            // API URL 생성 (쿼리 파라미터 포함)
            const query = new URLSearchParams({
                keyword: keyword, // 검색어
                limit: limit // 개수 제한
            });

            // *** 백엔드 서버에 GET 요청 및 응답 대기 ***
            const response = await fetch(`/api/tracks/search?${query}`); 
            // response : 응답 자체(헤더,상태코드)만 있음, 본문 데이터x

            // 백엔드 응답을 JSON 형식으로 변환
            const data = await response.json();

            // HTTP 응답 상태 코드 확인 (성공: 200~299 / 실패: 400,401,500)
            if (!response.ok) {

                setError(data.message || '검색 중 오류가 발생했습니다.');
                // API에서 받은 에러 메세지 사용 or 에러 메세지 띄우기
                setSearchResults([]);
                // 결과 초기화(에러 전 결과 제거)
                return;
            }

            // 성공 시 API 응답의 content 배열을 상태에 저장
            setSearchResults(data.content);
            // track 객체들 저장(spotifyId, title, artistName등)

        } catch (err) {
            // 네트워크 오류나 다른 문제 발생 시 처리
            setError('네트워크 오류가 발생했습니다.');
            setSearchResults([]);
        } finally {
            // 로딩 완료: 성공/실패 상관없이 로딩 상태를 false로 변경
            setIsLoading(false);
            // API 호출 완료 표시
        }
    };

    return (
        <main className="song-search-page">

            <h1>FIND YOUR NUMBER 18</h1>

            {/* 검색 입력 UI */}
            <div className="search-box">

                {/* 돋보기 아이콘 */}
                <img
                    src={searchIcon}
                    alt="검색"
                    className="search-icon"
                />

                {/* 입력창 요소
                    type="text": 텍스트 입력 타입
                    value={keyword}: 현재 입력값을 keyword 상태로 관리
                    onChange={handleInputChange}: 입력값 변할 때마다 상태 업데이트
                    placeholder="...": 입력 비었을 때 안내 문구
                    disabled={isLoading}: API 호출 중이면 입력 불가
                */}
                <input
                    type="text"
                    value={keyword}
                    onChange={handleInputChange}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            searchTracks();
                        }
                    }}
                    placeholder="검색할 노래 또는 아티스트 입력"
                    disabled={isLoading}
                    className="search-input"
                />

                {/* 검색 버튼 요소
                    onClick={searchTracks}: 클릭 -> API 호출 시작
                    disabled={isLoading}: API 호출 중이면 클릭 불가능 (중복 요청 방지)
                */}
                <button
                    onClick={searchTracks}
                    disabled={isLoading}
                    className="search-button"
                >
                    {/* 조건부 렌더링 : 현재 상태 시각적으로 피드백 */}
                    {isLoading ? '검색 중...' : '검색'}
                </button>
            </div>

            {/* 로딩 상태 표시
                API 호출 진행 중을 사용자에게 알림
                A && B : A(false)-> A 반환(B 평가x) / A(true) -> B(true) -> B 반환
            */}
            {isLoading && (
                <p className="loading-text">
                    검색 중입니다...
                </p>
            )}

            {/* 에러 메시지 표시
                error 상태가 null이 아닐 때(에러o)
            */}
            {error && (
                <p style={{ color: 'red' }}>
                    {error}
                </p>
            )}

            {/* 검색 결과 표시
                searchResults 내용 있을 때 렌더링
            */}
            {searchResults.length > 0 && (

                <div>

                    {/*<h2>
                        검색 결과 ({searchResults.length}개)
                    </h2>*/}

                    {/* 검색 결과 목록 표시 */}
                    <ul style={{
                        listStyle: 'none',
                        padding: 0
                    }}>

                        {searchResults.map((track) => (

                            <li key={track.spotifyId}>

                                {/* 앨범 커버 이미지 */}
                                <img
                                    src={track.albumCoverImageUrl}
                                    alt={track.title}
                                />

                                {/* 텍스트 영역 */}
                                <div className="track-info">

                                    {/* 곡 제목 */}
                                    <h3>{track.title}</h3>

                                    {/* 아티스트명 */}
                                    <p>{track.artistName}</p>

                                    {/* 추가 정보 표시 */}
                                    {track.previewUrl && (
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#666'
                                        }}>
                                            미리듣기 가능
                                        </p>
                                    )}

                                </div>

                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </main>
    );
}
