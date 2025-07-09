import { useState, useEffect, useCallback } from 'react';
import {
    ItemAvailabilitySlotModel,
    ItemAvailabilitySlotStatus,
    CreateItemAvailabilitySlotRequest,
} from '@/domain/models/item.model';
import { SlotsRepository } from '@/infrastructure/repositories/SlotsRepository';

interface SlotFilters {
    availability_id?: number;
    loan_request_id?: number;
    status?: ItemAvailabilitySlotStatus;
    start_date?: Date;
    end_date?: Date;
}

export const useSlots = (filters?: SlotFilters) => {
    const [slots, setSlots] = useState<ItemAvailabilitySlotModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slotsRepository = new SlotsRepository();

    const fetchSlots = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedSlots = await slotsRepository.getSlotsWithFilters(filters || {});
            setSlots(fetchedSlots);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch slots');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const createSlot = async (slotData: CreateItemAvailabilitySlotRequest): Promise<boolean> => {
        try {
            setLoading(true);
            const newSlot = await slotsRepository.createSlot(slotData);
            setSlots((prev) => [...prev, newSlot]);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create slot');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteSlot = async (slotId: number): Promise<boolean> => {
        try {
            setLoading(true);
            const success = await slotsRepository.deleteSlot(slotId);
            if (success) {
                setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
            }
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete slot');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const cancelSlot = async (slotId: number): Promise<boolean> => {
        try {
            setLoading(true);
            const success = await slotsRepository.cancelSlot(slotId);
            if (success) {
                setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
            }
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel slot');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const refetch = useCallback(() => {
        fetchSlots();
    }, [fetchSlots]);

    return {
        slots,
        loading,
        error,
        createSlot,
        deleteSlot,
        cancelSlot,
        refetch,
    };
};

export const useSlotById = (slotId: number | null) => {
    const [slot, setSlot] = useState<ItemAvailabilitySlotModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slotsRepository = new SlotsRepository();

    const fetchSlot = useCallback(async () => {
        if (!slotId) {
            setSlot(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const fetchedSlot = await slotsRepository.getSlotById(slotId);
            setSlot(fetchedSlot);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch slot');
        } finally {
            setLoading(false);
        }
    }, [slotId]);

    useEffect(() => {
        fetchSlot();
    }, [fetchSlot]);

    const refetch = useCallback(() => {
        fetchSlot();
    }, [fetchSlot]);

    return {
        slot,
        loading,
        error,
        refetch,
    };
};

export const useSlotsByAvailability = (availabilityId: number | null) => {
    const [slots, setSlots] = useState<ItemAvailabilitySlotModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slotsRepository = new SlotsRepository();

    const fetchSlots = useCallback(async () => {
        if (!availabilityId) {
            setSlots([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const fetchedSlots = await slotsRepository.getSlotsByAvailabilityId(availabilityId);
            setSlots(fetchedSlots);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch slots');
        } finally {
            setLoading(false);
        }
    }, [availabilityId]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const refetch = useCallback(() => {
        fetchSlots();
    }, [fetchSlots]);

    return {
        slots,
        loading,
        error,
        refetch,
    };
};

export const useSlotsByLoanRequest = (loanRequestId: number | null) => {
    const [slots, setSlots] = useState<ItemAvailabilitySlotModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slotsRepository = new SlotsRepository();

    const fetchSlots = useCallback(async () => {
        if (!loanRequestId) {
            setSlots([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const fetchedSlots = await slotsRepository.getSlotsByLoanRequestId(loanRequestId);
            setSlots(fetchedSlots);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch slots');
        } finally {
            setLoading(false);
        }
    }, [loanRequestId]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const refetch = useCallback(() => {
        fetchSlots();
    }, [fetchSlots]);

    return {
        slots,
        loading,
        error,
        refetch,
    };
};

export const useSlotConflicts = () => {
    const [conflicts, setConflicts] = useState<ItemAvailabilitySlotModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slotsRepository = new SlotsRepository();

    const checkConflicts = async (
        availabilityId: number,
        startDate: Date,
        endDate: Date,
        excludeSlotId?: number
    ): Promise<ItemAvailabilitySlotModel[]> => {
        setLoading(true);
        setError(null);

        try {
            const conflictingSlots = await slotsRepository.checkSlotConflicts(
                availabilityId,
                startDate,
                endDate,
                excludeSlotId
            );
            setConflicts(conflictingSlots);
            return conflictingSlots;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check conflicts');
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        conflicts,
        loading,
        error,
        checkConflicts,
    };
};

export const useAvailableSlots = () => {
    const [availableSlots, setAvailableSlots] = useState<ItemAvailabilitySlotModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slotsRepository = new SlotsRepository();

    const fetchAvailableSlots = async (
        availabilityId: number,
        startDate?: Date,
        endDate?: Date
    ): Promise<ItemAvailabilitySlotModel[]> => {
        setLoading(true);
        setError(null);

        try {
            const slots = await slotsRepository.getAvailableSlots(availabilityId, startDate, endDate);
            setAvailableSlots(slots);
            return slots;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch available slots');
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        availableSlots,
        loading,
        error,
        fetchAvailableSlots,
    };
};
