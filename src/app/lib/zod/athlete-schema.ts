import { z } from 'zod';

export const AthleteFormSchema = z.object({
    nik: z
        .string()
        .length(16, { message: 'NIK harus terdiri dari 16 digit.' })
        .regex(/^\d+$/, { message: 'NIK harus berupa angka.' }),
    nama: z.string().min(2, { message: 'Nama harus diisi minimal 2 karakter.' }),
    tempat_lahir: z.string().min(2, { message: 'Tempat lahir harus diisi.' }),
    tgl_lahir: z.date({
        required_error: "Tanggal lahir harus diisi.",
        invalid_type_error: "Format tanggal tidak valid."
    }),
    jenis_kelamin: z.enum(['MALE', 'FEMALE'], {
        required_error: "Jenis kelamin harus dipilih.",
    }),
    tinggi_badan: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().positive().optional()
    ),
    berat_badan: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().positive().optional()
    ),
    ukuran_baju: z.string().optional(),
    ukuran_sepatu: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().positive().optional()
    ),
    no_hp: z.string().optional(),
});

export type AthleteFormData = z.infer<typeof AthleteFormSchema>;
