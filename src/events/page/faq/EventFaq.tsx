import React, { useState } from 'react'
import { Box, Button, Card, Container } from '@mui/material'
import { Event, FaqCategory } from '../../../types'
import { useFaqs } from '../../../services/hooks/useFaqs'
import { FirestoreQueryLoaderAndErrorDisplay } from '../../../components/FirestoreQueryLoaderAndErrorDisplay'
import { FaqCategoryItem } from './FaqCategoryItem'
import { NewFaqCategoryDialog } from './NewFaqCategoryDialog'

export const EventFAQ = ({ event }: { event: Event }) => {
    const queryResult = useFaqs(event)
    const [addDialogOpen, setAddDialogOpen] = useState(false)

    if (queryResult.isLoading) {
        return <FirestoreQueryLoaderAndErrorDisplay hookResult={queryResult} />
    }

    const categoryData = queryResult.data || []

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card
                sx={{
                    padding: 2,
                    minHeight: '50vh',
                    display: 'flex',
                    flexDirection: 'column',
                    flexFlow: 'row',
                    flexWrap: 'wrap',
                    alignContent: 'flex-start',
                }}>
                {categoryData.map((faqCategory: FaqCategory) => (
                    <FaqCategoryItem key={faqCategory.id} category={faqCategory} event={event} />
                ))}
            </Card>
            <Box marginY={2}>
                <Button
                    onClick={() => {
                        setAddDialogOpen(true)
                    }}>
                    Add FAQ top-level category
                </Button>
            </Box>
            <NewFaqCategoryDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                categoryCount={categoryData.length}
                eventId={event.id}
            />
        </Container>
    )
}
