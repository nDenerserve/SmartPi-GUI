export class Momentary {

    constructor(
        public powerTotal: number,
        public power1: number,
        public power2: number,
        public power3: number,
        public current1: number,
        public current2: number,
        public current3: number,
        public current4: number,
        public voltage1: number,
        public voltage2: number,
        public voltage3: number,
        public cosphi1: number,
        public cosphi2: number,
        public cosphi3: number,
        public frequency1: number,
        public frequency2: number,
        public frequency3: number,
        public maxGUIPower: number,
        public maxGUICurrent: number[],
        serial: string,
        name: string,
        softwareversion: string,
        ipaddress: string
    ) { }
}
