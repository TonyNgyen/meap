'use server'

import { revalidatePath } from 'next/cache'

export async function generateRecipe(prevState: any, formData: FormData) {

    console.log('FormData received:', formData)

    const ingredients = formData.getAll('ingredients');

    const response = await fetch('http://127.0.0.1:8000/generate-recipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
    })

    if (!response.ok) {
        throw new Error('Failed to generate recipe')
    }

    revalidatePath('/fastAPI')
    
    return response.json()

}