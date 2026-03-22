import React from 'react'
import AppHeader from './_components/AppHeader'

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>){
    return (
        <div>
            <AppHeader />
            {children}
        </div>
    )
} 