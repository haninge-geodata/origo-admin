'use client';
import { useRouter } from "next/navigation";
import { LinkResourceService as service } from '@/api';
import { useQuery } from "@tanstack/react-query";
import LinkResourceForm from '@/views/sources/LinkResourceView';
import { LinkResourceDto } from "@/shared/interfaces/dtos";

export default function EditPage({ params: { id } }: any) {
    const router = useRouter();
    const { data: existingData, isLoading: existingDataLoading, error: existingDataError } =
        useQuery({ queryKey: ['sources'], queryFn: () => service.fetchAll() });

    const { data, isLoading, error } = useQuery({
        queryKey: ['linkResource', id],
        queryFn: () => service.fetch(id)
    });

    const handleUpdateClick = async (linkResource: LinkResourceDto) => {
        try {
            await service.update(id, linkResource);
            router.back();
        } catch (error) {
            console.error('Error updating link resource:', error);
        }
    };

    const handleCancelClick = () => {
        router.back();
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred: {error.message}</div>;

    return (
        (data && <LinkResourceForm
            existingData={existingData}
            initialData={data}
            onSubmit={handleUpdateClick}
            onCancel={handleCancelClick}
            submitButtonText="Uppdatera"
            title="Uppdatera Länkresurs"
        />)
    );
}