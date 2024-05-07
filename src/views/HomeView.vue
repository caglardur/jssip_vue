<template>
	<v-col class="pa-0">
		<v-col class="pb-0">
			<v-card>
				<v-col>
					<v-row align="center">
						<v-card-title>Sip Vue</v-card-title>
						<v-spacer></v-spacer>

						<v-col cols="auto">
							<v-chip variant="tonal" :color="connectionStatus.status ? 'green' : 'red'"
								prependIcon="mdi-circle" append-icon="mdi-cog" @click="changeSetting(true)">
								{{ connectionStatus.text }}
							</v-chip>
						</v-col>
					</v-row>
				</v-col>
			</v-card>
		</v-col>
		<Transition>
			<v-col class="pb-0" v-if="settingVisible">
				<v-card title="Ayarlar" append-icon="mdi-close" @click:append="changeSetting(false)">
					<template v-slot:append>
						<v-btn size="small" variant="text" icon="mdi-close" @click="changeSetting(false)"> </v-btn>
					</template>
					<v-col>
						<v-label>socket</v-label>
						<v-text-field v-model="socket" variant="outlined" density="compact" hide-details></v-text-field>
					</v-col>
					<v-col>
						<v-label>registrarServer</v-label>
						<v-text-field v-model="registrarServer" variant="outlined" density="compact"
							hide-details></v-text-field>
					</v-col>
					<v-col>
						<v-label>displayName</v-label>
						<v-text-field v-model="displayName" variant="outlined" density="compact"
							hide-details></v-text-field>
					</v-col>
					<v-col>
						<v-label>password</v-label>
						<v-text-field v-model="password" type="password" variant="outlined" density="compact"
							hide-details></v-text-field>
					</v-col>
					<v-col>
						<v-btn @click="connectToSip" variant="flat" color="green">Kaydet</v-btn>
					</v-col>
				</v-card>
			</v-col>
		</Transition>

		<v-col class="pb-0" v-if="connectionStatus.status">
			<v-card>
				<v-col>
					<v-label class="ps-4">Yeni Görüşme Oluştur:</v-label>
					<v-row>
						<v-col>
							<v-text-field v-model="phoneNumber" variant="outlined" density="compact" hideDetails
								@keyup.enter="outgoingCall" rounded="xl" baseColor="green" color="green" clearable
								bgColor="grey-lighten-4" class="pe-0"></v-text-field>
						</v-col>
						<v-col cols="auto" class="ps-0">
							<v-btn variant="outlined" type="submit" color="green" size="small" icon="mdi-phone"
								@click="outgoingCall"></v-btn>
						</v-col>
					</v-row>
				</v-col>
			</v-card>
		</v-col>

		<v-col v-for="(session, i) in liveSessionArray" :key="session.id" class="pb-0">
			<v-card v-if="session">
				<template v-slot:prepend>
					<v-col class="px-0">
						<v-icon color="green">{{ session.direction == "outgoing" ? "mdi-phone-outgoing" :
							"mdi-phone-incoming" }}</v-icon>
					</v-col>
				</template>
				<template v-slot:title>
					<v-col>
						{{ session.remote_identity.uri.user }}
					</v-col>
				</template>
				<template v-slot:append>
					<v-col class="px-0">
						<v-chip prepend-icon="mdi-circle" :color="sessionColor(session.status)">
							{{ SessionStatus[session.status] }}
						</v-chip>
					</v-col>
				</template>

				<v-card-actions v-if="session.status == 7 || session.status == 8" class="justify-center">
					<v-spacer></v-spacer>
					<v-col cols="auto">
						<v-btn size="small" @click="() => reCall(session.remote_identity.uri.user)" icon="mdi-phone"
							color="green" variant="flat">
						</v-btn>
					</v-col>
				</v-card-actions>
				<v-card-actions v-else align="bottom">
					<v-col>
						<ReferComp :session="session"
							@refer="(transferNumber: string) => refer(session, transferNumber)" />
					</v-col>
					<v-col class="text-right">
						<v-row>
							<v-spacer></v-spacer>
							<v-col cols="auto" v-if="session.status == 4">
								<v-btn size="small" @click="() => answer(session)" icon="mdi-phone" color="green"
									variant="flat"> </v-btn>
							</v-col>
							<v-col cols="auto" v-if="session.status == 9">
								<v-btn size="small" @click="() => hold(session)"
									:icon="session.isOnHold() ? 'mdi-pause' : 'mdi-play'" variant="flat"
									:color="session.isOnHold() ? 'grey' : 'yellow'"></v-btn>
							</v-col>
							<v-col cols="auto">
								<v-btn size="small" @click="() => close(session)" icon="mdi-phone-hangup" color="red"
									variant="flat"> </v-btn>
							</v-col>
						</v-row>
					</v-col>
				</v-card-actions>
			</v-card>
		</v-col>
	</v-col>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import JsSIP from "jssip";
import { useStorage } from "@vueuse/core";

import { useSessionStore } from "@/stores/sessionStore";
import audioPlayer from "@/components/audioPlayer";
import SessionEvent from "@/components/SessionEvent";

import type { RTCSessionEvent, UAConfiguration } from "jssip/lib/UA";
import type { RTCSession } from "jssip/lib/RTCSession";
import ReferComp from "@/components/ReferComp.vue";
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

// sip config
const password = useStorage("password", "");
const displayName = useStorage("display_name", "");
const registrarServer = useStorage("registrar_server", "");
const contactUri = useStorage("contact_uri", "");
const authorizationUser = useStorage("authorization_user", "");
const instanceId = useStorage("instance_id", "");
const sessionTimers = useStorage("session_timers", true);
const usePreloadedRoute = useStorage("use_preloaded_route", false);
const socket = useStorage("socket", "");

const connectionStatus = ref({
	status: false,
	text: ""
});

const getConfiguration = () => {
	return {
		uri: displayName.value + "@" + registrarServer.value,
		password: password.value,
		display_name: displayName.value,
		registrar_server: registrarServer.value,
		contact_uri: contactUri.value,
		authorization_user: authorizationUser.value,
		instance_id: instanceId.value,
		session_timers: sessionTimers.value,
		use_preloaded_route: usePreloadedRoute.value,
		sockets: [new JsSIP.WebSocketInterface(socket.value)]
	} as UAConfiguration;
};

const settingVisible = ref(false);

const changeSetting = (visible: boolean) => {
	settingVisible.value = visible;
};

const sessionStore = useSessionStore();
const liveSessionArray = shallowRef<RTCSession[]>([]);

const updateSession = computed(() => sessionStore.getUpdateSession);

watch(updateSession, () => {
	liveSessionArray.value = sessionStore.getLiveSessionArray;
});

const phoneNumber = ref("05555236661");

var ua1: JsSIP.UA;



const connectToSip = () => {


	const ua = new JsSIP.UA(getConfiguration());
	ua.start();
	ua1 = ua;

	// Bağlantı Durumları

	ua.on("connected", (data: any) => {
		console.log("connected", data);
		connectionStatus.value = {
			status: true,
			text: ""
		};
	});

	ua.on("disconnected", (data: any) => {
		console.log("disconnected", data);
		connectionStatus.value = {
			status: false,
			text: ""
		};
	});

	ua.on("connecting", (data: any) => {
		console.log("connecting", data);
		connectionStatus.value = {
			status: false,
			text: ""
		};
	});

	// Kayıt Durumları

	ua.on("registered", (data: any) => {
		console.log("registered", data);
		connectionStatus.value = {
			status: true,
			text: data.response.from.uri.user + "@" + data.response.from.uri.host
		};
	});

	ua.on("unregistered", (data: any) => {
		console.log("unregistered", data);
		connectionStatus.value = {
			status: false,
			text: ""
		};
	});

	ua.on("registrationFailed", (data: any) => {
		console.log("registrationFailed", data);
		connectionStatus.value = {
			status: false,
			text: data.cause
		};
	});

	ua.on("registrationExpiring", () => {
		console.log("registrationExpiring");
		connectionStatus.value = {
			status: true,
			text: ""
		};
	});

	// Çağrı Session Oluşturma

	ua.on("newRTCSession", (data: RTCSessionEvent) => {
		data.originator === "local" && audioPlayer.play("ringback", 1.0);
		console.log("newRTCSession", data);
		SessionEvent(data.session);
	});

};

displayName.value && registrarServer.value && connectToSip()


//fonkisyonlar
const outgoingCall = () => {
	const liveSessionArray = sessionStore.getLiveSessionArray;
	liveSessionArray.map((session) => {
		session.hold()
	})
	ua1.call(phoneNumber.value, {
		mediaConstraints: {
			audio: true,
			video: false
		}
	});
};

const reCall = (phoneNumber: string) => {
	ua1.call(phoneNumber, {
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

const refer = (session: RTCSession, transferNumber: string) => {

	const liveSessionArray = sessionStore.getLiveSessionArray;
	const otherSession = liveSessionArray.find((s) => s.remote_identity.uri.user == transferNumber);

	console.log("otherSession", otherSession);
	session.refer(transferNumber + "@san156.onlinetelekom.org", {
		eventHandlers: eventHandlers, replaces: otherSession ? otherSession : undefined
	});
	session.terminate()
};

</script>
