import React, { useState } from 'react';

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

         try{
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
            if (!response.ok){
                setError(data.message || '검색 중 오류가 발생했습니다.');
                // API에서 받은 에러 메세지 사용 or 에러 메세지 띄우기
                setSearchResults([]); // 결과 초기화(에러 전 결과 제거)
                return;
            }

            // 성공 시 API 응답의 content 배열을 상태에 저장
            setSearchResults(data.content); // track 객체들 저장(spotifyId, title, artistName등)

        } catch (err) {
            // 네트워크 오류나 다른 문제 발생 시 처리
            setError('네트워크 오류가 발생했습니다.');
            setSearchResults([]);
        } finally {
            // 로딩 완료: 성공/실패 상관없이 로딩 상태를 false로 변경
            setIsLoading(false); // API 호출 완료 표시
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>FIND YOUR NUMBER 18</h1>

            {/* 검색 입력 UI */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
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
                    placeholder="노래, 아티스트 검색"
                    disabled={isLoading}
                    style={{ padding: '8px', flex: 1 }}
                />

                {/* 검색 버튼 요소
                    onClick={searchTracks}: 클릭-> API 호출 시작
                    disabled={isLoading}: API 호출 중이면 클릭 불가능 (중복 요청 방지)
                */}
                <button
                    onClick={searchTracks}
                    disabled={isLoading}
                    style={{ padding: '8px 16px' }}
                >
                    {/* 조건부 렌더링 : 현재 상태 시각적으로 피드백 */}
                    {isLoading ? '검색 중...' : '검색'}
                </button>
            </div>

            {/* 로딩 상태 표시
                API 호출 진행 중을 사용자에게 알림
                A && B : A(false)-> A 반환(B 평가x) / A(true) -> B(true) -> B 반환
            */}
            {isLoading && <p style={{ color: 'blue' }}>검색 중입니다...</p>}

            {/* 에러 메시지 표시
                error 상태가 null이 아닐 때(에러o) -> <p> : 에러 원인 메세지 표시
            */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* 검색 결과 표시
                searchResults 내용 있을 때, <div> 블록 렌더링 : 없으면 표시x
            */}
            {searchResults.length > 0 && (
                <div>
                    <h2>검색 결과 ({searchResults.length}개)</h2>

                    {/* 검색 결과 목록 표시
                        .map() 메서드로 배열의 각 track 객체를 순회
                        각 track마다 <li> 요소로 변환하여 렌더링
                        track : content 배열 순회를 위한 변수 (임의 지정)
                    */}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {searchResults.map((track) => (
                            <li
                                // Sporify ID (UI 표시x)
                                key={track.spotifyId}
                                style={{
                                    padding: '10px',
                                    marginBottom: '10px',
                                    border: '1px solid #ddd'
                                }}
                            > {/* searchResults 배열의 곡(track)마다 <li> 만들기*/}
                            
                                {/* 각 검색 결과 아이템 (React 필수)
                                    key={track.spotifyId}: React가 리스트 아이템 구분을 위한 고유 식별자
                                    spotifyId는 API 응답에서 받은 각 곡의 고유 ID (중복 없음)
                                */}

                                {/* 앨범 커버 이미지 */}
                                {track.albumCoverImageUrl && (
                                    <img
                                        src={track.albumCoverImageUrl}
                                        alt={`${track.title} 앨범 커버`}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                )}

                                {/* 노래 제목 */}
                                <h3>{track.title}</h3>

                                {/* 아티스트명 */}
                                <p>{track.artistName}</p>

                                {/* Spotify 곡 상세 URL */}
                                <a href={track.spotifyUrl} target="_blank" rel="noreferrer">
                                    Spotify에서 보기
                                </a>

                                {/* 미리듣기 URL */}
                                {track.previewUrl && (
                                    <audio controls src={track.previewUrl}>
                                        미리듣기를 지원하지 않는 브라우저입니다.
                                    </audio>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
