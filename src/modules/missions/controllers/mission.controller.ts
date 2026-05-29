import { Body, Controller, Get, Path, Post, Query, Request, Response, Route, Tags } from "tsoa";
import type { Request as ExpressRequest } from "express";

import {
  AddMissionRequest,
  AddMissionResponse,
  ChallengeMissionRequest,
  ChallengeMissionResponse,
  MissionListByStoreResponse,
  MissionListByUserResponse,
  bodyToMission,
} from "../dtos/mission.dtos.js";
import {
  createMission,
  challengeMission,
  MissionsByStore,
  MissionsByUser,
} from "../services/mission.service.js";
import { ApiResponse, ErrorResponse, success } from "../../../common/responses/response.js";


// ✅ 1-3 미션 추가하기 & 2-1 특정 가게의 미션 목록 조회하기
@Route("stores")
@Tags("Mission")
export class StoreMissionController extends Controller {
  /**
   * 특정 가게에 새로운 미션을 추가합니다. (로그인 필요)
   * @summary 가게 미션 추가
   */
  @Post("missions")
  @Response<ErrorResponse>(401, "인증 실패")
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
   * 가게의 미션을 내 '도전 중인 미션' 목록에 추가합니다. (로그인 필요)
   * @summary 미션 도전 시작
   */
  @Post("challenge")
  @Response<ErrorResponse>(401, "인증 실패")
  @Response<ErrorResponse>(400, "존재하지 않는 미션")
  @Response<ErrorResponse>(409, "이미 도전 중인 미션")
  public async handleChallengeMission(
    @Request() request: ExpressRequest,
    @Body() requestBody: ChallengeMissionRequest
  ): Promise<ApiResponse<ChallengeMissionResponse>> {
    const userId = Number((request.user as { id: bigint }).id);
    const result = await challengeMission(requestBody, userId);
    return success(result as ChallengeMissionResponse);
  }
}


// ✅ 2-2 내가 도전 중인 미션 목록 조회하기
@Route("me")
@Tags("Mission")
export class MeMissionController extends Controller {
  /**
   * 내가 현재 도전 중인 미션 목록을 cursor 기반 페이지네이션으로 조회합니다. (로그인 필요)
   * @summary 내 도전 중인 미션 목록 조회
   */
  @Get("missions")
  @Response<ErrorResponse>(401, "인증 실패")
  @Response<ErrorResponse>(400, "존재하지 않는 사용자")
  public async handleGetMissionByUser(
    @Request() request: ExpressRequest,
    @Query() cursor?: number
  ): Promise<MissionListByUserResponse> {
    const userId = Number((request.user as { id: bigint }).id);
    return MissionsByUser(userId, cursor ?? 0);
  }
}
