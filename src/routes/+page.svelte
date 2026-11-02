<script>
	import AnalyticsTracker from '#lib/components/AnalyticsTracker.svelte'
	import HeroSection from '#lib/components/home/HeroSection.svelte'
	import PurposeSection from '#lib/components/home/PurposeSection.svelte'
	import PillarsSection from '#lib/components/home/PillarsSection.svelte'
	import ProjectsSection from '#lib/components/home/ProjectsSection.svelte'
	import VisionSection from '#lib/components/home/VisionSection.svelte'
	import BlogShowcase from '#lib/components/home/BlogShowcase.svelte'
	import AgendaStrip from '#lib/components/home/AgendaStrip.svelte'
	import GalleryShowcase from '#lib/components/home/GalleryShowcase.svelte'

	let { data } = $props()
</script>

<svelte:head>
	<title>CursoX</title>
</svelte:head>

<AnalyticsTracker />
<div class="bg-base">
	<HeroSection org={data.org} />
	<PurposeSection />
	<PillarsSection />
	<ProjectsSection projects={data.projects} />
	<VisionSection />
	<BlogShowcase posts={data.posts} />
	<AgendaStrip events={data.events} />
	<GalleryShowcase galleries={data.galleries} />
</div>
