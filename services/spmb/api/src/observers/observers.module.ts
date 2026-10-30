import { Module } from "@nestjs/common";
import { ObserversController } from "./observers.controller";
import { ObserversService } from "./observers.service";
import { SimpegObserverCandidateClient, SPMB_SIMPEG_OBSERVER_FETCH } from "./simpeg-observer-candidate.client";
import { SpmbObserverRoleBrokerClient, SPMB_AUTH_OBSERVER_ROLE_FETCH } from "./spmb-observer-role-broker.client";

@Module({
  controllers: [ObserversController],
  providers: [
    ObserversService,
    SimpegObserverCandidateClient,
    SpmbObserverRoleBrokerClient,
    { provide: SPMB_SIMPEG_OBSERVER_FETCH, useValue: fetch },
    { provide: SPMB_AUTH_OBSERVER_ROLE_FETCH, useValue: fetch },
  ],
})
export class ObserversModule {}
