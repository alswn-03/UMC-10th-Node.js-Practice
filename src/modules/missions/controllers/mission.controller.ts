import { Body, Controller, Get, Path, Post, Query, Response, Route, Tags } from "tsoa";

import {
  AddMissionRequest,
  AddMissionResponse,
  ChallengeMissionRequest,
  ChallengeMissionResponse,
  MissionListByStoreResponse,
  MissionListByUserResponse,
  bodyToMission,
  bodyToChallengeMission,
} from "../dtos/mission.dtos.js";
import {
  createMission,
  challengeMission,
  MissionsByStore,
  MissionsByUser,
} from "../services/mission.service.js";
import { ApiResponse, ErrorResponse, success } from "../../../common/responses/response.js";


// ✅ 1-3 미션 추가하기 & 2-1 특정 가게의 미션 목록 조회하기
// /stores 경로를 공유하는 미션 관련 엔드포인트를 하나의 컨트롤러로 묶음
@Route("stores")
@Tags("Mission")
export class StoreMissionController extends Controller {
  /**
   * 특정 가게에 새로운 미션을 추가합니다.
   * @summary 가게 미션 추가
   */
  @Post("missions")
  @Response<ErrorResponse>(400, "존재하지 않는 가게")
  public async handleAddMission(
    @Body() requestBody: AddMissionRequest
  ): Promise<ApiResponse<AddMissionResponse>> {
    const mission = await createMission(bodyToMission(requestBody));
    return success({ ...mission, missionId: Number(mission.missionId) });
  }

  /**
   * 특정 가게의 미션 목록을 cursor 기반 페이지네이션으로 조회합니다.
   * @summary 가게 미션 목록 조회
   */
  @Get("{storeId}/missions")
  @Response<ErrorResponse>(400, "존재하지 않는 가게")
  public async handleGetMissionsByStore(
    @Path() storeId: number,
    @Query() cursor?: number
  ): Promise<MissionListByStoreResponse> {
    return MissionsByStore(storeId, cursor ?? 0);
  }
}


// ✅ 1-4 가게의 미션을 '도전 중인 미션'에 추가하기
@Route("missions")
@Tags("Mission")
export class ChallengeMissionController extends Controller {
  /**
   * 가게의 미션을 내 '도전 중인 미션' 목록에 추가합니다.
   * @summary 미션 도전 시작
   */
  @Post("challenge")
  @Response<ErrorResponse>(400, "존재하지 않는 미션")
  @Response<ErrorResponse>(409, "이미 도전 중인 미션")
  public async handleChallengeMission(
    @Body() requestBody: ChallengeMissionRequest
  ): Promise<ApiResponse<ChallengeMissionResponse>> {
    const result = await challengeMission(bodyToChallengeMission(requestBody));
    return success(result as ChallengeMissionResponse);
  }
}


// ✅ 2-2 내가 도전 중인 미션 목록 조회하기
@Route("me")
@Tags("Mission")
export class MeMissionController extends Controller {
  /**
   * 내가 현재 도전 중인 미션 목록을 cursor 기반 페이지네이션으로 조회합니다.
   * @summary 내 도전 중인 미션 목록 조회
   */
  @Get("missions")
  @Response<ErrorResponse>(400, "존재하지 않는 사용자")
  public async handleGetMissionByUser(
    @Query() userId: number,
    @Query() cursor?: number
  ): Promise<MissionListByUserResponse> {
    return MissionsByUser(userId, cursor ?? 0);
  }
}
