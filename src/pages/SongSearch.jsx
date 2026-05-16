import React, { useState } from 'react';

export default function SongSearch() {
    // 사용자의 검색 키워드 저장
    const [keyword, setKeyword] = useState('');
    
    // API 응답으로 받은 검색 결과 저장 배열
    const [searchResults, setSearchResults] = useState([]);
    
    // 데이터 가져오는 중인지의 여부(로딩 표시용)
    const [isLoading, setIsLoading] = useState(false);
    
    // 에러 메세지(검색 실패 시 사용자에 알림)
    const [error, setError] = useState(null);
    
    // 검색 결과 개수 제한 (기본값 10)
    const [limit, setLimit] = useState(10);

    const handleInputChange = (event) => {
        setKeyword(event.target.value);
    };

    return (
        <div>
            <h1> Song Search</h1>
        </div>
    );
}