const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const bettingDao = require("../User/betting")
const { pool } = require("../../../config/database");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const moment = require("moment");
require("moment-timezone");
const {logger} = require("../../../config/winston");
moment.tz.setDefault("Asia/Seoul");


exports.makeBetting = async function (req, res) {
    /** userID 가져오기 (소셜 로그인 기능 구현 전까지 userID 더미값 이용)*/
    // const userId = req.token.userId;

    /** body 값에서 제목,내용,선택지들 가져오기 */
    const { userId, title, contents, lists, deadline, minimumPoint } = req.body;
    const params = [userId, title, contents, minimumPoint, deadline];

    /** 오늘 서버 날짜 */
    const today = moment().format("YYYYMMDD");

    /** Validation : 유저 인증 실패 */
    if (!userId) return res.send(errResponse(baseResponse.NOT_USER));

    /** Validation : 제목을 입력하지 않음  */
    if (!title) return res.send(errResponse(baseResponse.EMPTY_TITLE));

    /** Validation : 내용을 입력하지 않음 */
    if (!contents) return res.send(errResponse(baseResponse.EMPTY_CONTENTS));

    /** Validation : 마감일을 입력하지 않음 */
    if (!deadline) return res.send(errResponse(baseResponse.EMPTY_DEADLINE));

    /** Validation : 선택지를 입력하지 않거나, 5개 이상적으려고 함 */
    if (!lists || lists.length < 2 || lists.length > 5)
        return res.send(errResponse(baseResponse.INSERT_CHOICE));

    /** Validation : 마감일을 오늘 날짜보다 적게 설정 */
    if (today > deadline)
        return res.send(errResponse(baseResponse.WRONG_DEADLINE));

    const connection = await pool.getConnection((conn) => conn);

    try {
        /** 베팅장 생성 (선택지 제외 ) */
        const postBettingField = await bettingDao.makeBettingField(
            params,
            connection
        );

        // 방금 생성된 베팅장 ID
        const generatedFieldID = postBettingField[0].insertId;

        /** Validation : 베팅장 등록 실패 */
        if (!generatedFieldID)
            return res.send(errResponse(baseResponse.ERROR_MAKE_FIELD));

        let postChoice;

        /** 리스트(lists)에서 선택지 내용이랑 항목 번호 분리해서 선택지 테이블(choice)에 집어 넣기 */
        for (const value of lists) {
            let index = lists.indexOf(value);
            postChoice = await bettingDao.insertChoice(
                connection,
                generatedFieldID,
                index + 1,
                value
            );
        }

        /** Validation : 선택지 등록 실패 */
        if (!postChoice[0].insertId)
            return res.send(errResponse(baseResponse.ERROR_MAKE_CHOICE));

        connection.release();

        return res.send(
            response(baseResponse.SUCCESS("베팅장 등록에 성공했습니다."))
        );
    } catch (err) {
        logger.warn(err + "에러 발생");
        connection.release();
        return errResponse(baseResponse.FAIL);
    }
};

exports.getBetInfo = async function (req, res) {
    /** 데이터베이스로부터 가져오는 부분 */
    const connection = await pool.getConnection((conn) => conn);

    try {
        const bettingInfoList = await bettingDao.getBettingInfo(connection);
        console.log(bettingInfoList); // object

        return res.send(
            response(baseResponse.SUCCESS("getBetInfo"), bettingInfoList)
        );
    } catch (err) {
        logger.warn(err + "에러 발생");
        connection.release();
        return errResponse(baseResponse.FAIL);
    }
};

exports.getBettingField = async function (req, res) {
    /**앱에서 넘긴 path variable: boardID */
    const { boardID } = req.params;

    /** 데이터베이스로부터 가져오는 부분 */
    const connection = await pool.getConnection((conn) => conn);

    try {
        const bettingInfoList = await bettingDao.getBettingField(
            connection,
            boardID
        );

        return res.send(
            response(baseResponse.SUCCESS("getBetInfo"), bettingInfoList[0])
        );
    } catch (err) {
        logger.warn(err + "에러 발생");
        connection.release();
        return errResponse(baseResponse.FAIL);
    }
};

exports.betChoice = async function (req, res) {
    /** userID는 후에 소셜 로그인 구현 후 연결 */
    /*
    const token = req.verifiedToken;

    const userId = token.userId;*/

    /** 각종 파라미터들 가져오기
     *
     * boardID : 베팅할 베팅장 ID
     * choiceNum : 해당 베팅장의 선택지 번호
     * pointAmount : 사용자가 선택지에 베팅할 금액
     * */
    const boardId = Number(req.params["boardID"]);
    const { userId, choiceNum, pointAmount } = req.body;
    let updatedPoint;

    console.log(userId, choiceNum, pointAmount, boardId);

    const connection = await pool.getConnection((conn) => conn);

    /** Validation : 회원 인증이 안된 유저 */
    if (!userId) return res.send(errResponse(baseResponse.NOT_USER));

    const userInfo = await bettingDao.checkUserInfo(connection, userId);

    /** Validation : 유저ID를 이용해 정보를 조회했을 때 없는 경우 */
    if (userInfo.length === 0)
        return res.send(errResponse(baseResponse.WRONG_USER_INFO));

    /** Validation : BoardID가 존재하지 않거나 잘못되었을 때 */
    if (isNaN(boardId)) return res.send(errResponse(baseResponse.EMPTY_BOARD));

    /** Validation : 베팅장의 선택지를 입력하지 않았거나 잘못된 정보를 전달했을 때 */
    if (!choiceNum)
        return res.send(errResponse(baseResponse.EMPTY_CHOICE_NUMBER));

    /** Validation : 베팅할 때 포인트를 잘못 입력하거나 입력하지 않았을 때  */
    if (!pointAmount)
        return res.send(errResponse(baseResponse.WRONG_POINT_INPUT));

    /** boardID를 이용해 베팅장 정보 조회 */
    const checkExistBoard = await bettingDao.checkExistBoardID(
        connection,
        boardId
    );

    /** Validation : boardID 조회 후 만일 베팅장이 존재하지 않을 경우 */
    if (checkExistBoard.length === 0)
        return res.send(errResponse(baseResponse.EMPTY_BOARD));

    /** Validation : 이미 베팅했는지 여부 검사 */
    const checkAlreadyBet = await bettingDao.checkAlreadyBet(connection, userId);

    if (checkAlreadyBet.length > 0)
        return res.send(errResponse(baseResponse.ALREADY_BET));

    /** Validation : 베팅장에 설정된 최소 포인트보다 적게 베팅할 때 */
    if (pointAmount < checkExistBoard[0].minimumPoint)
        return res.send(errResponse(baseResponse.LESS_THEN_MINIMUM_POINT));

    /** boardID에 있는 선택지 정보를 가져오기 */
    const boardChoiceInfo = await bettingDao.getChoiceInfo(connection, boardId);

    /** existChoice : false = 베팅장의 선택지와 내가 원하는 선택지가 매칭되지 않음 | true = 베팅장의 선택지와 내가 원하는 선택지가 매칭됨 */
    let existChoice = false;
    let choiceID;

    /** 베팅장의 선택지 정보 순회 */
    for (let i in boardChoiceInfo) {
        // 베팅장의 선택지와 내가 원하는 선택지 번호가 일치하는게 있다면

        if (boardChoiceInfo[i].choiceNum === Number(choiceNum)) {
            // existChoice를 true로 변경
            existChoice = true;
            choiceID = boardChoiceInfo[i].choiceID;
        }
    }

    /** Validation : 베팅장의 선택지 번호 중에 내가 베팅 원하는 번호가 없을 경우 */
    if (existChoice === false)
        return res.send(errResponse(baseResponse.EMPTY_CHOICE_NUMBER));

    /** 베팅하기 (=BetField 에 정보 입력하기) */

    try {
        const insertBettingInfo = await bettingDao.insertBettingInfo(
            connection,
            choiceID,
            boardId,
            userId,
            pointAmount,
            choiceNum
        );

        /** 사용자의 포인트에서 베팅할 포인트 금액 차감 */
        updatedPoint = userInfo[0].point - pointAmount;
        const updateUserPoint = await bettingDao.updateUserPoint(
            connection,
            userId,
            updatedPoint
        );

        /** Validation : 베팅 포인트 입력 오류 */
        if (updateUserPoint.affectedRows === 0)
            return res.send(errResponse(baseResponse.ERROR_POINT_UPDATED));

        connection.release();

        return res.send(response(baseResponse.SUCCESS("베팅에 성공하셨습니다.")));
    } catch (err) {
        logger.warn(err + "에러 발생");
        connection.release();
        return errResponse(baseResponse.FAIL);
    }
};

exports.getBettingChoice = async function (req, res) {
    /**앱에서 넘긴 path variable: boardID */
    const { boardID } = req.params;

    /** 데이터베이스로부터 가져오는 부분 */
    const connection = await pool.getConnection((conn) => conn);

    try {
        const bettingChoiceList = await bettingDao.getBettingChoice(
            connection,
            boardID
        );

        const result = bettingChoiceList.map((item) => {
            const string = item.message;
            return string;
        });

        return res.send(response(baseResponse.SUCCESS("getBetInfo"), result));
    } catch (err) {
        logger.warn(err + "에러 발생");
        connection.release();
        return errResponse(baseResponse.FAIL);
    }
};
