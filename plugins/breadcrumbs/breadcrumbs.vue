<template>
  <v-card flat class="mb-2">
    <v-breadcrumbs divider="/" style="padding: 8px 12px">
      <v-breadcrumbs-item v-for="item in items" :key="item.text" :disabled="item.disabled || false" :to="item.to">
        {{ item.text }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>
  </v-card>
</template>

<script>
  import breadcrumbs from '~/plugins/breadcrumbs/breadcrumbs'

  export default {
    data: () => ({
      items: []
    }),
    beforeMount () {
      breadcrumbs.event.$off('set_items').$on('set_items', items => {
        this.set_items(items)
      })
    },
    methods: {
      set_items (items) {
        console.log('method:set_items', items)
        this.items = items
      }
    }
  }
</script>

<style>
</style>
