module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

/*    // 0. 테스트 API
    // app.get('/app/test', user.getTest)

    // 1. 유저 생성 (회원가입) API
    app.post('/app/users', user.postUsers);

    // 2. 유저 조회 API (+ 검색)
    app.get('/app/users',user.getUsers);

    // 3. 특정 유저 조회 API
    app.get('/app/users/:userId', user.getUserById);


    // TODO: After 로그인 인증 방법 (JWT)
    // 로그인 하기 API (JWT 생성)
    app.post('/app/login', user.login);

    // 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)
    app.patch('/app/users/:userId', jwtMiddleware, user.patchUsers)*/

    /**메인 홈 화면 베팅 리스트 가져오기 API */
    app.get("/bets", user.getBetInfo);

    /**베팅창 세부 항목 가져오기 API */
    app.get("/bets/fields/:boardID", user.getBettingField);

    /**베팅 등록하기 API */
    app.post("/bets/fields", user.makeBetting);

    /**각 베팅의 선택지 가져오기 API */
    app.get("/bets/fields/:boardID/choice", user.getBettingChoice);

    /**베팅 선택지 등록하기 API */
    app.post("/bets/fields/:boardID/choice", user.betChoice);



};


// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
// app.get('/app/auto-login', jwtMiddleware, user.check);

// TODO: 탈퇴하기 API
