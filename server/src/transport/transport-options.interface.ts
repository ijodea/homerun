export interface TransportOption {
    type: string;
    waitingTime: number | null;
    totalTime: number | null;
    cost: number;
    seats?: number;
    bonus?: number;
    departureTime?: Date;
    arrivalTime?: Date;
}