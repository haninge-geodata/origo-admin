'use client';
import { useRouter } from "next/navigation";
import { LinkResourceService as service } from '@/api';
import { LinkResourceDto } from "@/shared/interfaces/dtos";
import LinkResourceForm from '@/views/sources/LinkResourceView';
import { useQuery } from "@tanstack/react-query";

export default function AddPage() {
    const router = useRouter();
    const { data, isLoading, error } = useQuery({ queryKey: ['sources'], queryFn: () => service.fetchAll() });

    const handleAddClick = async (linkResource: LinkResourceDto) => {
        try {
            await service.add(linkResource);
            router.back();
        } catch (error) {
            console.error('Error adding link resource:', error);
        }
    };

    const handleCancelClick = () => {
        router.back();
    };

    return (
        (data && <LinkResourceForm
            existingData={data}
            onSubmit={handleAddClick}
            onCancel={handleCancelClick}
            submitButtonText="Lägg till"
            title="Lägg till Länkresurs"
        />)
    );
}