import { useSessionStore } from "@/stores/sessionStore";
import type { RTCSession } from "jssip/lib/RTCSession";
import audioPlayer from "./audioPlayer";

export default function SessionEvent(session: RTCSession) {
	const sessionStore = useSessionStore();

	sessionStore.setLiveSessionArray(session);
	

	const audio = new Audio();
	audio.autoplay = true;

	session.on("peerconnection", (data: any) => {
		console.log("peerconnection", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("connecting", (data: any) => {
		console.log("connecting", data);
		const mediaStream = new MediaStream(
			session.connection.getReceivers().map(receiver => {
				return receiver.track;
			})
		);
		audio.srcObject = mediaStream;
		audio.play();
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("sending", (data: any) => {
		console.log("sending", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("progress", (data: any) => {
		console.log("progress", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("accepted", (data: any) => {
		console.log("accepted", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("confirmed", (data: any) => {
		console.log("confirmed", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("ended", (data: any) => {
		console.log("ended", data);
		audioPlayer.play("rejected", 1.0);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("failed", (data: any) => {
		console.log("failed", data);
		audioPlayer.play("rejected", 1.0);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("newDTMF", (data: any) => {
		console.log("newDTMF", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("newInfo", (data: any) => {
		console.log("newInfo", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("hold", (data: any) => {
		console.log("hold", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("unhold", (data: any) => {
		console.log("unhold", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("muted", (data: any) => {
		console.log("muted", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("unmuted", (data: any) => {
		console.log("unmuted", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("reinvite", (data: any) => {
		console.log("reinvite", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("update", (data: any) => {
		console.log("update", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("refer", (data: any) => {
		console.log("refer", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("replaces", (data: any) => {
		console.log("replaces", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("sdp", (data: any) => {
		// console.log("sdp", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("icecandidate", (data: any) => {
		// console.log("icecandidate", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("getusermediafailed", (data: any) => {
		console.log("getusermediafailed", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("peerconnection:createofferfailed", (data: any) => {
		console.log("peerconnection:createofferfailed", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("peerconnection:createanswerfailed", (data: any) => {
		console.log("peerconnection:createanswerfailed", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("peerconnection:setlocaldescriptionfailed", (data: any) => {
		console.log("peerconnection:setlocaldescriptionfailed", data);
		sessionStore.setLiveSessionArray(session);
		
	});

	session.on("peerconnection:setremotedescriptionfailed", (data: any) => {
		console.log("peerconnection:setremotedescriptionfailed", data);
		sessionStore.setLiveSessionArray(session);
		
	});
}
