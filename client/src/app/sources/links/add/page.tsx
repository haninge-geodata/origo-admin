'use client';
import { useRouter } from "next/navigation";
import { LinkResourceService as service } from '@/api';
import { LinkResourceDto } from "@/shared/interfaces/dtos";
import LinkResourceForm from '@/views/sources/LinkResourceView';
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";

export default function AddPage() {
    const router = useRouter();
    const { showToastAfterNavigation, showToast } = useApp();
    const { data, isLoading, error } = useQuery({ queryKey: ['sources'], queryFn: () => service.fetchAll() });

    const handleAddClick = async (linkResource: LinkResourceDto) => {
        try {
            await service.add(linkResource);
            showToastAfterNavigation('Länkresurs sparad', 'success');

            router.back();
        } catch (error) {
            showToast('Ett fel uppstod vid sparande av länkresurs', 'error');
            console.error(`[${Date.now()}] Error adding link resource: ${error}`);
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