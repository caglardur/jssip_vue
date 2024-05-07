import type {  SessionStatus } from "jssip/lib/RTCSession";

export interface SessionStatusType {
	status: SessionStatus;
	direction: string | null;
	couse: string;
	startTime: Date | null;
	endTime: Date | null;
	remote: string | null;
}