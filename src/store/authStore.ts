import { create } from 'zustand';
import { isLiveMode, supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import type { User } from '@supabase/supabase-js';
import { mockCurrentUser } from '@/data/staticData';

interface AuthStore {
    user: User | null
    profile: Profile | null
    isLoading: boolean
    initialize: () => Promise<void>
    signUp: (email: string, password:string, fullname:string) => Promise<void>
    signIn: (email: string, password:string) => Promise<void>
    signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
    user:null,
    profile:mockCurrentUser,
    isLoading: true,

    initialize: async () => {
        if (!isLiveMode) {
            await new Promise((r) => setTimeout(r, 400))
            set({ user: {id: mockCurrentUser.id} as User, isLoading:false})
            return
        }

        const { data: {session}} = await supabase.auth.getSession()
        if (session?.user) {
            const {data:profile} = await supabase.from('users').select('*').eq('id', session.user.id).single()

            set({ user: session.user, profile, isLoading: false})
        } else {
            set({ isLoading: false })
        }

        supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single()

                set({ user: session.user, profile })
            } else {
                set({ user: null, profile: null})
            }
        })
    },

    signUp: async (email, password, fullName) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        })
        if (error) throw error
    },

    signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password})
        if(error) throw error
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null})
    },

}))