<template>
	<v-card>
		<v-col>{{ session.status }}</v-col>
		<template v-slot:prepend>
			<v-col class="px-0">
				<v-icon color="green">{{ session.direction == "outgoing" ? "mdi-phone-outgoing" : "mdi-phone-incoming" }}</v-icon>
			</v-col>
		</template>
		<template v-slot:title>
			<v-col>
				{{ session.remote_identity.uri.user }}
			</v-col>
		</template>
		<template v-slot:append>
			<v-col class="pa-0">
				<v-col v-if="session.status == 9" class="px-0">
					<v-chip prepend-icon="mdi-circle" :color="sessionColor(session.status)">
						{{ calculateSessionTime(session) }}
					</v-chip>
				</v-col>
				<v-col v-else class="px-0">
					<v-chip prepend-icon="mdi-circle" :color="sessionColor(session.status)">
						{{ SessionStatus[session.status] }}
					</v-chip>
				</v-col>
			</v-col>
		</template>

		<v-col>
			<v-row align="center">
				<v-col cols="auto">Transfer Et:</v-col>
				<v-col>
					<v-text-field variant="outlined" density="compact" hideDetails rounded="xl" baseColor="green" color="green" clearable bgColor="grey-lighten-4" class="pe-0"></v-text-field>
				</v-col>
				<v-col cols="auto" class="ps-0">
					<v-btn variant="outlined" color="green" size="small" icon="mdi-phone-outgoing" @click="() => refer(session)"></v-btn>
				</v-col>
			</v-row>
		</v-col>

		<v-card-actions v-if="session.status == 7 || session.status == 8" class="justify-center">
			<v-col cols="auto">
				<v-btn block variant="tonal" @click="() => reCall(session.remote_identity.uri.user)" color="black"> Tekrar Ara </v-btn>
			</v-col>
		</v-card-actions>
		<v-card-actions v-else class="justify-center">
			<v-col cols="auto">
				<v-btn size="x-small" @click="() => answer(session)" icon="mdi-phone" color="green" variant="flat"> </v-btn>
			</v-col>
			<v-col cols="auto">
				<v-btn size="x-small" @click="() => hold(session)" icon="mdi-pause" color="grey" variant="flat"></v-btn>
			</v-col>
			<v-col cols="auto">
				<v-btn size="x-small" @click="() => close(session)" icon="mdi-phone-hangup" color="red" variant="flat"> </v-btn>
			</v-col>
		</v-card-actions>
	</v-card>
</template>

<script setup lang="ts">
import { RTCSession } from "jssip/lib/RTCSession";
import type { UA } from "jssip/lib/UA";
import type { PropType } from "vue";
import { useSessionStore } from "@/stores/sessionStore";
import { computed, ref, shallowRef } from "vue";
import { watch } from "vue";

const sessionStore = useSessionStore();
const props = defineProps({
	sessionDetail: {
		type: Object as PropType<RTCSession>,
		required: true
	},
	sessionId: {
		type: String,
		required: true
	},
	ua: {
		type: Object as PropType<UA>,
		required: true
	}
});

const session = ref<RTCSession>(props.sessionDetail);

const updateSession = computed(() => sessionStore.getUpdateSession);

watch(updateSession, () => {
	console.log("aaa", sessionStore.getSessionById(props.sessionId).status);
	session.value = { ...sessionStore.getSessionById(props.sessionId) } as RTCSession;
});

enum SessionStatus {
	"Belirsiz" = 0,
	"Aranıyor" = 1,
	"Çalıyor" = 2,
	"İstek Alındı" = 3,
	"Gelen Arama" = 4,
	"Cevaplandı" = 5,
	STATUS_WAITING_FOR_ACK = 6,
	"İptal Edildi" = 7,
	"Sonlandırıldı" = 8,
	"Bağlandı" = 9
}

const calculateSessionTime = (session: RTCSession) => {
	return "00:00";
};

const eventHandlers = {
	requestSucceeded: (data: any) => {
		console.log("requestSucceeded", data);
	},
	requestFailed: (data: any) => {
		console.log("requestFailed", data);
	},
	trying: (data: any) => {
		console.log("trying", data);
	},
	progress: (data: any) => {
		console.log("progress", data);
	},
	accepted: (data: any) => {
		console.log("accepted", data);
	},
	failed: (data: any) => {
		console.log("failed", data);
	}
};

const refer = (session: RTCSession) => {
	console.log("refer", session);
	session.refer("175@san156.onlinetelekom.org", {
		eventHandlers: eventHandlers
	});
};

const reCall = (phoneNumber: string) => {
	props.ua.call(phoneNumber, {
		mediaConstraints: {
			audio: true,
			video: false
		}
	});
};

const answer = (session: RTCSession) => {
	session.answer();
};

const close = (session: RTCSession) => {
	if (session.status == 4) {
		session.terminate({
			status_code: 486,
			reason_phrase: "Busy Here"
		});
	} else {
		session.terminate();
	}
};

const hold = (session: RTCSession) => {
	if (session.isOnHold().local) {
		session.unhold();
		session.unmute();
	} else {
		session.hold();
		session.mute();
	}
};

const sessionColor = (status: number) => {
	switch (status) {
		case 1:
			return "blue";
		case 2:
			return "green";
		case 3:
			return "green";
		case 4:
			return "green";
		case 5:
			return "green";
		case 6:
			return "green";
		case 7:
			return "red";
		case 8:
			return "red";
		case 9:
			return "green";
		default:
			return "grey";
	}
};
</script>

<style scoped></style>
