<template>
	<v-col class="pa-0">
		<v-row align="center">
			<v-col>
				<v-text-field v-model="transferNumber" variant="outlined" density="compact" hideDetails rounded="xl"
					baseColor="green" color="green" clearable bgColor="grey-lighten-4" class="pe-0"
					placeholder="Aktar..."></v-text-field>
			</v-col>
			<v-col cols="auto" class="ps-0">
				<v-btn variant="outlined" color="green" size="small" icon="mdi-phone-outgoing"
					@click="() => emit('refer', transferNumber)"></v-btn>
			</v-col>
		</v-row>
	</v-col>
</template>

<script setup lang="ts">
import { ref } from "vue";

const transferNumber = ref("");

const emit = defineEmits(["refer"]);
</script>

<style scoped></style>
