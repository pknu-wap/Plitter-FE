import React, { useState } from 'react';

// === 프론트엔드 테스트용 모의(Mock) 데이터 ===
// 백엔드 서버 없이 UI 테스트할 때 사용
// 나중에 실제 백엔드 API로 전환할 때 이 부분 삭제 가능
const mockTracks = [
    {
        spotifyId: '1',
        title: 'Baby',
        artistName: 'Justin Bieber',
        albumCoverImageUrl: 'https://via.placeholder.com/150',
        previewUrl: 'https://example.com/preview1.mp3',
        spotifyUrl: 'https://open.spotify.com/track/1'
    },
    {
        spotifyId: '2',
        title: 'Sorry',
        artistName: 'Justin Bieber',
        albumCoverImageUrl: 'https://via.placeholder.com/150',
        previewUrl: 'https://example.com/preview2.mp3',
        spotifyUrl: 'https://open.spotify.com/track/2'
    },
    {
        spotifyId: '3',
        title: 'Love Yourself',
        artistName: 'Justin Bieber',
        albumCoverImageUrl: 'https://via.placeholder.com/150',
        previewUrl: 'https://example.com/preview3.mp3',
        spotifyUrl: 'https://open.spotify.com/track/3'
    }
];

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
        setKeyword(event.target.value);
        // 입력창 값을 keyword에 저장
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
            // === 현재 상태: 테스트용 모의 데이터 사용 ===
            // 실제 백엔드 연결하려면 아래로 변경:
            // const response = await fetch(`http://localhost:8080/api/tracks/search?keyword=${keyword}&limit=${limit}`);
            
            // 모의 데이터로 테스트 (네트워크 요청 없음)
            // 500ms 딜레이로 실제 API 호출처럼 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 500));

            // 모의 응답 객체 생성 (실제 API 응답 형식과 동일)
            const mockResponse = {
                code: 'SUCCESS',
                message: '요청이 성공적으로 처리되었습니다.',
                // 검색어가 포함된 곡들만 필터링 (테스트용)
                content: mockTracks.filter(track =>
                    track.title.toLowerCase().includes(keyword.toLowerCase()) ||
                    track.artistName.toLowerCase().includes(keyword.toLowerCase())
                )
            };

            // 성공 시 API 응답의 content 배열을 상태에 저장
            setSearchResults(mockResponse.content);

            // 검색 결과가 없을 때 에러 메시지 표시
            if (mockResponse.content.length === 0) {
                setError('검색 결과가 없습니다.');
            }

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
            <h1>FIND YOU NUMBER 18</h1>

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
                    placeholder="검색할 노래 또는 아티스트 입력"
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
                    */}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {searchResults.map((track) => (
                            <li
                                key={track.spotifyId}
                                style={{
                                    padding: '10px',
                                    marginBottom: '10px',
                                    border: '1px solid #ddd'
                                }}
                            >
                                {/* 각 검색 결과 아이템 (React 필수)
                                    key={track.spotifyId}: React가 리스트 아이템 구분을 위한 고유 식별자
                                    spotifyId는 API 응답에서 받은 각 곡의 고유 ID (중복 없음)
                                */}

                                {/* 곡 제목 */}
                                <h3>{track.title}</h3>

                                {/* 아티스트명 */}
                                <p>{track.artistName}</p>

                                {/* 추가 정보 표시 (선택사항)
                                    albumCoverImageUrl, previewUrl, spotifyUrl은 나중에 이미지나 재생 버튼으로 활용 가능
                                */}
                                
                                {track.previewUrl && (
                                    <p style={{ fontSize: '12px', color: '#666' }}>
                                        미리듣기 가능
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}