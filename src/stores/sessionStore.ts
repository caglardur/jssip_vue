import { RTCSession } from "jssip/lib/RTCSession";
import { defineStore } from "pinia";
import { markRaw, ref } from "vue";

export const useSessionStore = defineStore("session-store", {
	state: () => ({
		updateSession: 1,
		liveSessionArray: ref([] as RTCSession[])
	}),
	getters: {
		getLiveSessionArray(state): RTCSession[] {
			return state.liveSessionArray;
		},
		getUpdateSession(state): number {
			return state.updateSession;
		},
		getSessionById: state => (id: string) => {
			return state.liveSessionArray.find(session => session.id === id) as RTCSession;
		}
	},
	actions: {
		setLiveSessionArray(session: RTCSession) {
			console.log("session.status", session)
			let outer = {} as { session: RTCSession };
			Object.defineProperty(outer, "session", {
				value: markRaw(session),
				writable: false,
				configurable: false
			});
			const findIndex = this.liveSessionArray.findIndex(item => item.id === outer.session.id);
			if (findIndex > -1) {
				this.liveSessionArray.splice(findIndex, 1);
			}
			this.liveSessionArray = [outer.session, ...this.liveSessionArray];
			this.updateSession++;
		}
	}
});
