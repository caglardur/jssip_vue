<template>
	<v-container>
		<v-sheet width="500" class="mx-auto" color="transparent">
			<HomeViewVue />
		</v-sheet>
	</v-container>
</template>

<script setup lang="ts">
import HomeViewVue from "@/views/HomeView.vue";
</script>

<style>
body {
	background-color: #f5f5f5;
}

.v-enter-active,
.v-leave-active {
	transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>