<template>
  <v-app>
    <v-content>
      <v-container fluid tag="section" id="grid">
        <v-layout row wrap>
          <v-flex d-flex xs12 order-xs5>
            <v-layout column>
              <v-flex tag="h1" class="display mb-2">
                <v-layout row wrap>
                  <v-flex xs12 sm6>
                    User - {{ user.handle }}
                  </v-flex>
                  <v-flex xs12 sm6>
                    <div v-if="activeTab === 'profile'">
                      <v-btn small color="success" @click="dialog = true" style="float:right" :ripple="false">Edit Profile</v-btn>
                    </div>
                    <div v-if="activeTab === 'messages'">
                      <v-btn small color="success" @click="dialog = true" style="float:right" :ripple="false">Send Message</v-btn>
                    </div>
                    <div v-if="activeTab === 'friends'">
                      
                    </div>
                    <div v-if="activeTab === 'albums'">
                      
                    </div>
                    <div v-if="activeTab === 'videos'">
                      
                    </div>
                    <div v-if="activeTab === 'subscription'">
                      <v-btn small color="success" @click="dialog = true" style="float:right" :ripple="false">Cancel Subscription</v-btn>
                      <v-btn small color="success" @click="dialog = true" style="float:right" :ripple="false">Send Reminder</v-btn>
                    </div>
                    <!--<v-btn small color="success" @click="prompt()" style="float:right" :ripple="false">Watch</v-btn>-->
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex>
                <breadcrumbs/>
                <alerts/>

                <v-tabs v-model="activeTab" show-arrows class="elevation-1">
                  <v-tab ripple :href="`#profile`">Profile</v-tab>
                  <v-tab ripple :href="`#messages`">Messages</v-tab>
                  <v-tab ripple :href="`#friends`">Friends</v-tab>
                  <v-tab ripple :href="`#albums`">Albums</v-tab>
                  <v-tab ripple :href="`#videos`">Videos</v-tab>
                  <v-tab ripple :href="`#subscription`">Subscription</v-tab>
                  
                  <v-tab-item :id="`profile`" :transition="false" :reverse-transition="false">
                    <img id="picture" class="img-responsive" :src="`https://dev.beboyz.info/profilepics/${user.picture}`"/>
                    <pre>{{ user }}</pre>
                  </v-tab-item>
                  <v-tab-item :id="`messages`" :transition="false" :reverse-transition="false">
                    messages tab, this will be a component
                  </v-tab-item>
                  <v-tab-item :id="`friends`" :transition="false" :reverse-transition="false">
                    friends tab, this will be a component
                  </v-tab-item>
                  <v-tab-item :id="`albums`" :transition="false" :reverse-transition="false">
                    albums tab, this will be a component
                  </v-tab-item>
                  <v-tab-item :id="`videos`" :transition="false" :reverse-transition="false">
                    videos tab, this will be a component
                  </v-tab-item>
                  <v-tab-item :id="`subscription`" :transition="false" :reverse-transition="false">
                    subscription tab, this will be a component
                  </v-tab-item>
                </v-tabs>
                
                
                <nuxt-link class="button" to="/users">Users</nuxt-link>
                
                
                
                
                

              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from '~/plugins/axios'

export default {
  head () {
    return {
      title: `User: ${this.user.handle}`
    }
  },
  middleware: 'authenticated',
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated',
      loggedUser: 'auth/loggedUser',
      loggedToken: 'auth/loggedToken'
    })
  },
  asyncData ({ params }) {
    return { params: params }
  },
  data: () => ({
    user: {},
    activeTab: 'profile'
  }),
  mounted: function () {
    axios.defaults.headers.common['authorization'] = this.loggedToken

    // let server know where I am
    this.$io.socket.emit('location', { name: this.$route.name, action: 'view', id: this.params.id })

    // set breadcrumbs
    this.$breadcrumbs.set([
      { text: 'Dashboard', disabled: false, to: '/' },
      { text: 'Users', disabled: false, to: '/users' },
      { text: 'View', disabled: false, to: '/users' }
    ])

    //
    this.initialize()
  },
  methods: {
    initialize () {
      console.log(this.$route)

      axios.get('/api/users/' + this.params.id).then(res => {
        this.user = res.data
      }).catch(e => {
        this.$nuxt.error({
          statusCode: e.response.status,
          statusText: e.response.statusText,
          message: e.response.data.error.message
        })
      })
    }
  }
}
</script>

<style>

</style>