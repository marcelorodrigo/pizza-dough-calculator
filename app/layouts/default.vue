<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <OfflineStatus />
    <PwaUpdatePrompt />
    <main
      id="main-content"
      class="mx-auto w-[min(1160px,calc(100%_-_48px))] flex-1 pt-[46px] pb-[70px] below-720:w-[calc(100%_-_30px)] below-720:pt-[28px] below-720:pb-[48px]"
    >
      <slot />
    </main>
    <footer
      class="site-footer mx-auto flex w-[min(1160px,calc(100%_-_48px))] justify-between border-t border-line pt-[18px] pb-[24px] font-mono text-[10px] tracking-[0.03em] uppercase text-muted-soft below-720:w-[calc(100%_-_30px)] below-720:text-[9px] below-420:gap-[12px]"
    >
      <span>Good dough takes time.</span>
      <span>Keep your hands floured.</span>
    </footer>
  </div>
</template>
