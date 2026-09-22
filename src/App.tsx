import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  GraduationCap,
  Home,
  AlertTriangle,
  Compass,
  PenLine,
  Paperclip,
  Eraser,
  Download,
  ClipboardList,
  Loader2,
  AlertCircle,
  Search,
  MapPin,
  X,
  ExternalLink,
  RefreshCw,
  Users,
  Sprout,
  Link2,
  FileText,
  BarChart3,
} from "lucide-react";

/**
 * Satu-satunya sumber URL Web App Apps Script, dipakai oleh:
 *  - FormValidasiATS (POST — menyimpan data baru)
 *  - DataATSApp       (GET  — menampilkan seluruh data)
 * Ganti dengan Web App URL hasil deploy Code.gs kalau berubah.
 */
const GOOGLE_SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyR0I-6E4kJNiX9TSr_FwSL7G6GT2mhT5uZv5glYCC8R15zO8mv7zBUx-K2z-HSi35y/exec";

/* ==================================================================== */
/*  BAGIAN 1 — FORM INPUT DATA (FormValidasiATS)                        */
/* ==================================================================== */

/* ------------------------------------------------------------------ */
/*  Data referensi dari Formulir Instrumen Validasi ATS Kemdikdasmen   */
/* ------------------------------------------------------------------ */

const AGAMA_OPTIONS = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya",
];

const STATUS_ANAK_OPTIONS = [
  "Anak kandung",
  "Anak angkat",
  "Anak tiri",
  "Anak asuh",
];

const KONDISI_FISIK_OPTIONS = [
  { value: "Sehat Jasmani dan Rohani", detail: false },
  { value: "Berkebutuhan Khusus (ABK)", detail: true },
  { value: "Memiliki hambatan fisik/mental tertentu", detail: true },
];

const PERNAH_BERSEKOLAH_OPTIONS = [
  "Belum Pernah Bersekolah (BPB)",
  "Pernah Bersekolah, Namun Putus Sekolah (DO)",
  "Lulus tapi Tidak Melanjutkan (LTM)",
];

const LTM_OPTIONS = [
  "LTM SD (Lulus SD Tapi Tidak Melanjutkan)",
  "LTM SMP (Lulus SMP Tapi Tidak Melanjutkan)",
];

const JENJANG_GROUPS = [
  {
    label: "SD/Sederajat",
    tingkat: [
      "Tingkat 1",
      "Tingkat 2",
      "Tingkat 3",
      "Tingkat 4",
      "Tingkat 5",
      "Tingkat 6",
    ],
  },
  { label: "SMP/Sederajat", tingkat: ["Tingkat 7", "Tingkat 8", "Tingkat 9"] },
  {
    label: "SMA/Sederajat",
    tingkat: ["Tingkat 10", "Tingkat 11", "Tingkat 12"],
  },
];

const ALASAN_TIDAK_SEKOLAH_OPTIONS = [
  "Tidak mau bersekolah",
  "Tidak ada biaya",
  "Sekolah jauh dari rumah",
  "Sudah cukup dengan tingkat pendidikan yang dimiliki saat ini",
  "Menikah / mengurus rumah tangga",
  "Mengalami kekerasan/perundungan/trauma di sekolah",
  "Bekerja",
  "Pengaruh lingkungan/teman",
  "Beranggapan sekolah tidak penting",
  "Tidak memiliki seragam sekolah",
  "Tidak memiliki Akta Kelahiran",
  "Masalah Kesehatan / Penyandang Disabilitas",
  "Dikeluarkan",
  "Mengundurkan Diri",
  "Anak Tidak Ditemukan",
  "Melanjutkan ke Luar Negeri",
  "Melanjutkan ke Pondok Pesantren atau Lainnya",
  "Meninggal Dunia",
  "Bersekolah",
  "Pindah Domisili",
  "Sudah Tamat SMA/Sederajat",
  "Bukan Penduduk Desa Tersebut",
];

const KONDISI_ORTU_OPTIONS = [
  "Kedua orang tua masih hidup",
  "Hanya ayah yang hidup",
  "Hanya ibu yang hidup",
  "Kedua orang tua sudah meninggal",
  "Orang tua tidak diketahui keberadaannya",
];

const PENGHASILAN_OPTIONS = [
  "< Rp 500.000",
  "Rp 500.000 – Rp 1.000.000",
  "Rp 1.000.000 – Rp 2.000.000",
  "> Rp 2.000.000",
  "Tidak memiliki penghasilan tetap",
];

const BANTUAN_KELUARGA_OPTIONS = [
  "Tidak",
  "PKH (Program Keluarga Harapan)",
  "Lainnya",
];

const USIA_ATS_OPTIONS = [
  "7–12 tahun",
  "13–15 tahun",
  "16–18 tahun",
  "19–25 tahun",
];

const KONDISI_TEMPAT_TINGGAL_OPTIONS = [
  "Daerah tertinggal/terbelakang/perbatasan",
  "Daerah rawan konflik/bencana/darurat lainnya",
  "Wilayah yang sulit ditempuh/dijangkau/terpencil",
  "Wilayah dengan jumlah satuan pendidikan terbatas",
  "Wilayah kekurangan guru",
];

const SATUAN_PENDIDIKAN_OPTIONS = [
  "SD",
  "SMP/MTs/sederajat",
  "SMA/SMK/MA/sederajat",
  "SLB",
  "SKB/PKBM",
  "Pondok Pesantren",
  "Sekolah rumah yang belum terafiliasi",
];

const MINAT_BAKAT_OPTIONS = [
  "Seni",
  "Olahraga",
  "Teknologi",
  "Bahasa",
  "Sains",
  "Keterampilan vokasional",
];

const KESIAPAN_OPTIONS = [
  "Siap langsung masuk jalur formal",
  "Lebih cocok jalur nonformal (kesetaraan)",
  "Lebih cocok program keaksaraan dasar",
  "Minat pelatihan keterampilan kerja",
  "Masih ragu/dibutuhkan motivasi lebih lanjut",
];

const JALUR_REINTEGRASI_OPTIONS = [
  "SD/MI",
  "SMP/MTs",
  "SMA/MA",
  "SMK/MAK",
  "Paket A",
  "Paket B",
  "Paket C",
  "Program Keaksaraan Dasar",
  "Program Keaksaraan Lanjutan",
  "Kursus/Pelatihan Kerja/Kewirausahaan",
];

const LAMPIRAN_ITEMS = [
  { key: "fotoAnak", label: "Foto anak", optional: true },
  {
    key: "fotoRumah",
    label: "Foto rumah atau lingkungan tempat tinggal",
    optional: true,
  },
  {
    key: "ijazahRapor",
    label: "Salinan Ijazah/Rapor terakhir",
    optional: false,
  },
  { key: "kk", label: "Salinan KK", optional: false },
  { key: "ktpOrtu", label: "Salinan KTP orang tua/wali", optional: false },
  { key: "aktaLahir", label: "Salinan Akta Kelahiran", optional: false },
];

const initialFormData = {
  // Header
  tanggalPendataan: "",
  namaRelawan: "",
  emailRelawan: "",
  organisasiMitra: "",
  kabupatenKota: "",
  kecamatan: "",
  desaKelurahan: "",
  // A
  namaLengkap: "",
  nik: "",
  tempatLahir: "",
  tanggalLahir: "",
  jenisKelamin: "",
  namaIbuKandung: "",
  alamatTinggal: "",
  agama: "",
  agamaLainnya: "",
  statusAnak: "",
  kondisiFisikMental: "",
  kondisiFisikMentalKeterangan: "",
  // B
  pernahBersekolah: "",
  pernahBersekolahLTM: "",
  jenjangKategori: "",
  jenjangTingkat: "",
  nisn: "",
  npsn: "",
  namaSekolahTerakhir: "",
  tahunLulusPutus: "",
  alasanTidakSekolah: [] as string[],
  alasanTidakSekolahLainnya: "",
  // C
  kondisiOrangTua: "",
  tinggalDenganSiapa: "",
  pekerjaanAyah: "",
  pekerjaanIbu: "",
  pekerjaanWali: "",
  penghasilanKeluarga: "",
  bantuanSosialKeluarga: "",
  bantuanSosialKeluargaLainnya: "",
  bantuanSosialAnak: "",
  bantuanSosialAnakJenis: "",
  // D
  usiaATS: "",
  kondisiTempatTinggal: [] as string[],
  kondisiTempatTinggalLainnya: "",
  satuanPendidikanTerdekat: [] as string[],
  satuanPendidikanTerdekatLainnya: "",
  // E
  minatBakat: [] as string[],
  minatBakatLainnya: "",
  kesiapanKembaliBersekolah: "",
  saranJalurReintegrasi: [] as string[],
  saranJalurReintegrasiLainnya: "",
  // F
  namaOrangTuaWali: "",
  catatanTambahan: "",
  tempatTanggal: "",
  koordinatorNama: "",
  koordinatorJabatan: "",
  relawanNamaTtd: "",
};

type ATSFormData = typeof initialFormData;

/* ------------------------------------------------------------------ */
/*  Komponen field generik                                             */
/* ------------------------------------------------------------------ */

interface FieldShellProps {
  label: string;
  number?: number | string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function FieldShell({
  label,
  number,
  required,
  hint,
  children,
}: FieldShellProps) {
  return (
    <div className="py-4 border-b border-stone-200 last:border-b-0">
      <label className="block text-sm font-medium text-stone-800 mb-2">
        {number && (
          <span className="text-stone-400 mr-1.5 tabular-nums">{number}.</span>
        )}
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-stone-500 mb-2 -mt-1">{hint}</p>}
      {children}
    </div>
  );
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
    />
  );
}

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

function TextArea({ value, onChange, placeholder, rows = 3 }: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition resize-none"
    />
  );
}

type RadioOption = string | { value: string; detail?: boolean };

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
}

function RadioGroup({
  options,
  value,
  onChange,
  columns = 1,
}: RadioGroupProps) {
  return (
    <div
      className={
        columns === 2
          ? "grid grid-cols-1 sm:grid-cols-2 gap-2"
          : "flex flex-col gap-2"
      }
    >
      {options.map((opt) => {
        const label = typeof opt === "string" ? opt : opt.value;
        const active = value === label;
        return (
          <button
            type="button"
            key={label}
            onClick={() => onChange(label)}
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm text-left transition ${
              active
                ? "border-teal-600 bg-teal-50 text-teal-900"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                active ? "border-teal-600 bg-teal-600" : "border-stone-400"
              }`}
            >
              {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

interface CheckboxGroupProps {
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  columns?: number;
}

function CheckboxGroup({
  options,
  values,
  onChange,
  columns = 1,
}: CheckboxGroupProps) {
  const toggle = (label: string) => {
    if (values.includes(label)) onChange(values.filter((v) => v !== label));
    else onChange([...values, label]);
  };
  return (
    <div
      className={
        columns === 2
          ? "grid grid-cols-1 sm:grid-cols-2 gap-2"
          : "flex flex-col gap-2"
      }
    >
      {options.map((label) => {
        const active = values.includes(label);
        return (
          <button
            type="button"
            key={label}
            onClick={() => toggle(label)}
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm text-left transition ${
              active
                ? "border-teal-600 bg-teal-50 text-teal-900"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                active ? "border-teal-600 bg-teal-600" : "border-stone-400"
              }`}
            >
              {active && (
                <Check size={11} strokeWidth={3} className="text-white" />
              )}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tanda tangan digital (canvas)                                      */
/* ------------------------------------------------------------------ */

interface SignaturePadProps {
  onChange?: (dataUrl: string | null) => void;
}

function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const nativeEvent = e.nativeEvent as MouseEvent & TouchEvent;
    const clientX =
      "touches" in nativeEvent && nativeEvent.touches?.[0]
        ? nativeEvent.touches[0].clientX
        : (nativeEvent as MouseEvent).clientX;
    const clientY =
      "touches" in nativeEvent && nativeEvent.touches?.[0]
        ? nativeEvent.touches[0].clientY
        : (nativeEvent as MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1c1917";
    ctx.lineTo(x, y);
    ctx.stroke();
    setEmpty(false);
  };

  const end = () => {
    if (drawing.current) {
      drawing.current = false;
      const canvas = canvasRef.current;
      if (canvas) onChange?.(canvas.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
    onChange?.(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-stone-500">
          {empty
            ? "Bubuhkan tanda tangan di area ini"
            : "Tanda tangan tersimpan"}
        </span>
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-rose-600 transition"
        >
          <Eraser size={12} /> Hapus
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={140}
        className="w-full rounded-lg border border-dashed border-stone-300 bg-stone-50 touch-none"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lampiran (unggah berkas)                                           */
/* ------------------------------------------------------------------ */

interface LampiranItem {
  key: string;
  label: string;
  optional: boolean;
}

interface LampiranUploadProps {
  item: LampiranItem;
  file: File | null | undefined;
  onChange: (file: File | null) => void;
}

function LampiranUpload({ item, file, onChange }: LampiranUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm text-stone-800 truncate">
          {item.label}
          {!item.optional && <span className="text-rose-500 ml-1">*</span>}
          {item.optional && (
            <span className="text-stone-400 text-xs ml-1.5">(opsional)</span>
          )}
        </p>
        {file && (
          <p className="text-xs text-teal-700 truncate mt-0.5">{file.name}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:border-teal-600 hover:text-teal-700 transition"
        >
          <Paperclip size={12} />
          {file ? "Ganti" : "Unggah"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Konfigurasi bagian formulir                                        */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  { id: "identitas", label: "Petugas", icon: ClipboardList },
  { id: "a", label: "A. Data Anak", icon: User },
  { id: "b", label: "B. Riwayat Pendidikan", icon: GraduationCap },
  { id: "c", label: "C. Sosial Ekonomi", icon: Home },
  { id: "d", label: "D. Kelompok Masalah", icon: AlertTriangle },
  { id: "e", label: "E. Kebutuhan Belajar", icon: Compass },
  { id: "f", label: "F. Verifikasi", icon: PenLine },
  { id: "lampiran", label: "Lampiran", icon: Paperclip },
];

/* ------------------------------------------------------------------ */
/*  Helper: File -> base64 (untuk dikirim ke Apps Script)              */
/* ------------------------------------------------------------------ */

interface Base64File {
  data: string;
  mimeType: string;
  name: string;
}

function fileToBase64(file: File): Promise<Base64File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [, base64] = result.split(",");
      resolve({
        data: base64,
        mimeType: file.type || "application/octet-stream",
        name: file.name,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToBase64(dataUrl: string | null): Base64File | null {
  if (!dataUrl) return null;
  const [meta, base64] = dataUrl.split(",");
  const mimeType = meta.match(/data:(.*);base64/)?.[1] || "image/png";
  return { data: base64, mimeType, name: "" };
}

/* ------------------------------------------------------------------ */
/*  Field section A–F, dipakai bersama oleh FormValidasiATS (input     */
/*  baru, per-step) dan drawer edit di DataATSApp (semua sekaligus).   */
/* ------------------------------------------------------------------ */

interface ATSFormFieldsProps {
  formData: any;
  set: (key: string) => (value: any) => void;
  sections: string[];
}

function ATSFormFields({ formData, set, sections }: ATSFormFieldsProps) {
  const show = (id: string) => sections.includes(id);

  return (
    <>
      {show("identitas") && (
        <>
          <FieldShell label="Tanggal Pendataan" required>
            <TextInput
              type="date"
              value={formData.tanggalPendataan}
              onChange={set("tanggalPendataan")}
            />
          </FieldShell>
          <FieldShell label="Nama Relawan" required>
            <TextInput
              value={formData.namaRelawan}
              onChange={set("namaRelawan")}
              placeholder="Nama lengkap relawan"
            />
          </FieldShell>
          <FieldShell
            label="E-mail Pribadi Relawan"
            required
            hint="Instrumen yang sudah diisi akan terkirim ke email masing-masing relawan."
          >
            <TextInput
              type="email"
              value={formData.emailRelawan}
              onChange={set("emailRelawan")}
              placeholder="nama@email.com"
            />
          </FieldShell>
          <FieldShell label="Organisasi Mitra" required>
            <TextInput
              value={formData.organisasiMitra}
              onChange={set("organisasiMitra")}
            />
          </FieldShell>
          <FieldShell label="Kabupaten/Kota" required>
            <TextInput
              value={formData.kabupatenKota}
              onChange={set("kabupatenKota")}
            />
          </FieldShell>
          <FieldShell label="Kecamatan" required>
            <TextInput value={formData.kecamatan} onChange={set("kecamatan")} />
          </FieldShell>
          <FieldShell label="Desa/Kelurahan" required>
            <TextInput
              value={formData.desaKelurahan}
              onChange={set("desaKelurahan")}
            />
          </FieldShell>
        </>
      )}

      {show("a") && (
        <>
          <FieldShell
            number={1}
            label="Nama Lengkap sesuai Kartu Keluarga"
            required
          >
            <TextInput
              value={formData.namaLengkap}
              onChange={set("namaLengkap")}
            />
          </FieldShell>
          <FieldShell
            number={2}
            label="Nomor Induk Kependudukan sesuai Kartu Keluarga"
            required
          >
            <TextInput
              value={formData.nik}
              onChange={set("nik")}
              placeholder="16 digit NIK"
            />
          </FieldShell>
          <FieldShell number={3} label="Tempat Lahir" required>
            <TextInput
              value={formData.tempatLahir}
              onChange={set("tempatLahir")}
            />
          </FieldShell>
          <FieldShell number={4} label="Tanggal Lahir" required>
            <TextInput
              type="date"
              value={formData.tanggalLahir}
              onChange={set("tanggalLahir")}
            />
          </FieldShell>
          <FieldShell number={5} label="Jenis Kelamin" required>
            <RadioGroup
              options={["Laki-Laki", "Perempuan"]}
              value={formData.jenisKelamin}
              onChange={set("jenisKelamin")}
              columns={2}
            />
          </FieldShell>
          <FieldShell number={6} label="Nama Ibu Kandung" required>
            <TextInput
              value={formData.namaIbuKandung}
              onChange={set("namaIbuKandung")}
            />
          </FieldShell>
          <FieldShell
            number={7}
            label="Alamat Tempat Tinggal"
            required
            hint="Lengkap dengan nama desa/kel/kec/jalan/rt/rw."
          >
            <TextArea
              value={formData.alamatTinggal}
              onChange={set("alamatTinggal")}
              rows={3}
            />
          </FieldShell>
          <FieldShell number={8} label="Agama" required>
            <RadioGroup
              options={AGAMA_OPTIONS}
              value={formData.agama}
              onChange={set("agama")}
              columns={2}
            />
            {formData.agama === "Lainnya" && (
              <div className="mt-2">
                <TextInput
                  value={formData.agamaLainnya}
                  onChange={set("agamaLainnya")}
                  placeholder="Sebutkan agama lainnya"
                />
              </div>
            )}
          </FieldShell>
          <FieldShell number={9} label="Status Anak Tidak Sekolah" required>
            <RadioGroup
              options={STATUS_ANAK_OPTIONS}
              value={formData.statusAnak}
              onChange={set("statusAnak")}
              columns={2}
            />
          </FieldShell>
          <FieldShell number={10} label="Kondisi Fisik/Mental ATS" required>
            <RadioGroup
              options={KONDISI_FISIK_OPTIONS}
              value={formData.kondisiFisikMental}
              onChange={set("kondisiFisikMental")}
            />
            {(formData.kondisiFisikMental === "Berkebutuhan Khusus (ABK)" ||
              formData.kondisiFisikMental ===
                "Memiliki hambatan fisik/mental tertentu") && (
              <div className="mt-2">
                <TextInput
                  value={formData.kondisiFisikMentalKeterangan}
                  onChange={set("kondisiFisikMentalKeterangan")}
                  placeholder="Jelaskan kondisi/hambatan"
                />
              </div>
            )}
          </FieldShell>
        </>
      )}

      {show("b") && (
        <>
          <FieldShell
            number={11}
            label="Pernah Bersekolah?"
            required
            hint="Pilih sesuai kondisi."
          >
            <RadioGroup
              options={PERNAH_BERSEKOLAH_OPTIONS}
              value={formData.pernahBersekolah}
              onChange={(val) => {
                set("pernahBersekolah")(val);
                if (val !== "Lulus tapi Tidak Melanjutkan (LTM)") {
                  set("pernahBersekolahLTM")("");
                }
              }}
            />
            {formData.pernahBersekolah ===
              "Lulus tapi Tidak Melanjutkan (LTM)" && (
              <div className="mt-2 ml-6 pl-3 border-l-2 border-teal-200">
                <RadioGroup
                  options={LTM_OPTIONS}
                  value={formData.pernahBersekolahLTM}
                  onChange={set("pernahBersekolahLTM")}
                />
              </div>
            )}
          </FieldShell>
          <FieldShell
            number={12}
            label="Jenjang Pendidikan Terakhir (jika ada)"
            hint="Pilih jenjang, lalu pilih tingkat/kelas terakhir yang ditempuh."
          >
            <div className="flex flex-col gap-2">
              {JENJANG_GROUPS.map((group) => {
                const active = formData.jenjangKategori === group.label;
                return (
                  <div
                    key={group.label}
                    className={`rounded-lg border overflow-hidden transition ${
                      active ? "border-teal-600" : "border-stone-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const wasActive =
                          formData.jenjangKategori === group.label;
                        set("jenjangKategori")(group.label);
                        if (!wasActive) set("jenjangTingkat")("");
                      }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-left transition ${
                        active
                          ? "bg-teal-50 text-teal-900 font-medium"
                          : "bg-white text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          active
                            ? "border-teal-600 bg-teal-600"
                            : "border-stone-400"
                        }`}
                      >
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      {group.label}
                    </button>
                    {active && (
                      <div className="px-3 pb-3 pt-1 border-t border-teal-100 bg-teal-50/40">
                        <p className="text-xs text-stone-500 mb-1.5 mt-2">
                          Pilih tingkat terakhir
                        </p>
                        <RadioGroup
                          options={group.tingkat}
                          value={formData.jenjangTingkat}
                          onChange={set("jenjangTingkat")}
                          columns={2}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </FieldShell>
          <FieldShell number={13} label="Nomor Induk Siswa Nasional (NISN)">
            <TextInput value={formData.nisn} onChange={set("nisn")} />
          </FieldShell>
          <FieldShell number={14} label="NPSN (sekolah terakhir)">
            <TextInput value={formData.npsn} onChange={set("npsn")} />
          </FieldShell>
          <FieldShell number={15} label="Nama Sekolah Terakhir">
            <TextInput
              value={formData.namaSekolahTerakhir}
              onChange={set("namaSekolahTerakhir")}
            />
          </FieldShell>
          <FieldShell number={16} label="Tahun Lulus/Putus Sekolah">
            <TextInput
              value={formData.tahunLulusPutus}
              onChange={set("tahunLulusPutus")}
              placeholder="cth. 2022"
            />
          </FieldShell>
          <FieldShell
            number={17}
            label="Alasan Tidak Sekolah / Putus Sekolah"
            hint="Boleh lebih dari satu."
          >
            <CheckboxGroup
              options={ALASAN_TIDAK_SEKOLAH_OPTIONS}
              values={formData.alasanTidakSekolah}
              onChange={set("alasanTidakSekolah")}
              columns={2}
            />
            {formData.alasanTidakSekolah.length > 0 && (
              <div className="mt-2">
                <TextInput
                  value={formData.alasanTidakSekolahLainnya}
                  onChange={set("alasanTidakSekolahLainnya")}
                  placeholder="Lainnya (selain dari referensi yang ada)"
                />
              </div>
            )}
          </FieldShell>
        </>
      )}

      {show("c") && (
        <>
          <FieldShell number={18} label="Kondisi Orang Tua/Wali" required>
            <RadioGroup
              options={KONDISI_ORTU_OPTIONS}
              value={formData.kondisiOrangTua}
              onChange={set("kondisiOrangTua")}
            />
            <div className="mt-2">
              <TextInput
                value={formData.tinggalDenganSiapa}
                onChange={set("tinggalDenganSiapa")}
                placeholder="ATS saat ini tinggal dengan siapa? (tante, paman, nenek, kakek, dll)"
              />
            </div>
          </FieldShell>
          <FieldShell number={19} label="Pekerjaan Utama Orang Tua/Wali">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <TextInput
                value={formData.pekerjaanAyah}
                onChange={set("pekerjaanAyah")}
                placeholder="Ayah"
              />
              <TextInput
                value={formData.pekerjaanIbu}
                onChange={set("pekerjaanIbu")}
                placeholder="Ibu"
              />
              <TextInput
                value={formData.pekerjaanWali}
                onChange={set("pekerjaanWali")}
                placeholder="Wali (jika ada)"
              />
            </div>
          </FieldShell>
          <FieldShell
            number={20}
            label="Penghasilan Rata-Rata Keluarga per Bulan"
            required
          >
            <RadioGroup
              options={PENGHASILAN_OPTIONS}
              value={formData.penghasilanKeluarga}
              onChange={set("penghasilanKeluarga")}
            />
          </FieldShell>
          <FieldShell
            number={21}
            label="Apakah keluarga sedang atau pernah menerima bantuan sosial/pendidikan?"
          >
            <RadioGroup
              options={BANTUAN_KELUARGA_OPTIONS}
              value={formData.bantuanSosialKeluarga}
              onChange={set("bantuanSosialKeluarga")}
            />
            {formData.bantuanSosialKeluarga === "Lainnya" && (
              <div className="mt-2">
                <TextInput
                  value={formData.bantuanSosialKeluargaLainnya}
                  onChange={set("bantuanSosialKeluargaLainnya")}
                  placeholder="Sebutkan bantuan lainnya"
                />
              </div>
            )}
          </FieldShell>
          <FieldShell
            number={22}
            label="Apakah anak sedang atau pernah menerima bantuan sosial/pendidikan?"
          >
            <RadioGroup
              options={["Tidak", "Ya"]}
              value={formData.bantuanSosialAnak}
              onChange={set("bantuanSosialAnak")}
              columns={2}
            />
            {formData.bantuanSosialAnak === "Ya" && (
              <div className="mt-2">
                <TextInput
                  value={formData.bantuanSosialAnakJenis}
                  onChange={set("bantuanSosialAnakJenis")}
                  placeholder="cth. PIP, BOSP, Kartu Indonesia Pintar, dll"
                />
              </div>
            )}
          </FieldShell>
        </>
      )}

      {show("d") && (
        <>
          <FieldShell
            number={23}
            label="Usia ATS Saat Ini"
            hint="Jika ATS tidak memiliki dokumen kelahiran."
          >
            <RadioGroup
              options={USIA_ATS_OPTIONS}
              value={formData.usiaATS}
              onChange={set("usiaATS")}
              columns={2}
            />
          </FieldShell>
          <FieldShell
            number={24}
            label="Kondisi Tempat Tinggal"
            hint="Boleh pilih lebih dari satu."
          >
            <CheckboxGroup
              options={KONDISI_TEMPAT_TINGGAL_OPTIONS}
              values={formData.kondisiTempatTinggal}
              onChange={set("kondisiTempatTinggal")}
            />
            <div className="mt-2">
              <TextInput
                value={formData.kondisiTempatTinggalLainnya}
                onChange={set("kondisiTempatTinggalLainnya")}
                placeholder="Jenis wilayah tinggal lainnya"
              />
            </div>
          </FieldShell>
          <FieldShell
            number={25}
            label="Jenis Satuan Pendidikan Terdekat"
            hint="Terdapat di wilayah tempat tinggal, boleh lebih dari satu."
          >
            <CheckboxGroup
              options={SATUAN_PENDIDIKAN_OPTIONS}
              values={formData.satuanPendidikanTerdekat}
              onChange={set("satuanPendidikanTerdekat")}
              columns={2}
            />
            <div className="mt-2">
              <TextInput
                value={formData.satuanPendidikanTerdekatLainnya}
                onChange={set("satuanPendidikanTerdekatLainnya")}
                placeholder="Lainnya"
              />
            </div>
          </FieldShell>
        </>
      )}

      {show("e") && (
        <>
          <FieldShell
            number={26}
            label="Minat dan Bakat Anak"
            hint="Jika diketahui."
          >
            <CheckboxGroup
              options={MINAT_BAKAT_OPTIONS}
              values={formData.minatBakat}
              onChange={set("minatBakat")}
              columns={2}
            />
            <div className="mt-2">
              <TextInput
                value={formData.minatBakatLainnya}
                onChange={set("minatBakatLainnya")}
                placeholder="Lainnya"
              />
            </div>
          </FieldShell>
          <FieldShell number={27} label="Kesiapan untuk Kembali Bersekolah">
            <RadioGroup
              options={KESIAPAN_OPTIONS}
              value={formData.kesiapanKembaliBersekolah}
              onChange={set("kesiapanKembaliBersekolah")}
            />
          </FieldShell>
          <FieldShell
            number={28}
            label="Saran Jalur Reintegrasi Pendidikan"
            hint="Sesuai dengan kondisi anak."
          >
            <CheckboxGroup
              options={JALUR_REINTEGRASI_OPTIONS}
              values={formData.saranJalurReintegrasi}
              onChange={set("saranJalurReintegrasi")}
              columns={2}
            />
            <div className="mt-2">
              <TextInput
                value={formData.saranJalurReintegrasiLainnya}
                onChange={set("saranJalurReintegrasiLainnya")}
                placeholder="Lainnya"
              />
            </div>
          </FieldShell>
        </>
      )}

      {show("f") && (
        <>
          <p className="text-xs text-stone-500 pt-4">
            Isi salah satu sesuai kondisi.
          </p>
          <FieldShell number={29} label="Nama Orang Tua/Wali">
            <TextInput
              value={formData.namaOrangTuaWali}
              onChange={set("namaOrangTuaWali")}
            />
          </FieldShell>
          <FieldShell number={30} label="Catatan Tambahan Relawan Pendidikan">
            <TextArea
              value={formData.catatanTambahan}
              onChange={set("catatanTambahan")}
              rows={3}
            />
          </FieldShell>
          <FieldShell label="Tempat, Tanggal Bulan Tahun">
            <TextInput
              value={formData.tempatTanggal}
              onChange={set("tempatTanggal")}
              placeholder="cth. Sinjai, 8 Agustus 2026"
            />
          </FieldShell>
          <FieldShell label="Koordinator Organisasi Mitra — Nama">
            <TextInput
              value={formData.koordinatorNama}
              onChange={set("koordinatorNama")}
            />
          </FieldShell>
          <FieldShell label="Koordinator Organisasi Mitra — Jabatan">
            <TextInput
              value={formData.koordinatorJabatan}
              onChange={set("koordinatorJabatan")}
            />
          </FieldShell>
          <FieldShell label="Relawan — Nama">
            <TextInput
              value={formData.relawanNamaTtd}
              onChange={set("relawanNamaTtd")}
            />
          </FieldShell>
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Komponen: FormValidasiATS                                          */
/*  onGoToData: dipanggil dari layar sukses untuk pindah ke tab viewer  */
/* ------------------------------------------------------------------ */

interface FormValidasiATSProps {
  onGoToData?: () => void;
}

function FormValidasiATS({ onGoToData }: FormValidasiATSProps) {
  const [formData, setFormData] = useState<ATSFormData>(initialFormData);
  const [lampiran, setLampiran] = useState<Record<string, File | null>>({});
  const [signatures, setSignatures] = useState<{
    ortu: string | null;
    koordinator: string | null;
    relawan: string | null;
  }>({
    ortu: null,
    koordinator: null,
    relawan: null,
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const set = (key: string) => (value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));
  const setLampiranFile = (key: string) => (file: File | null) =>
    setLampiran((prev) => ({ ...prev, [key]: file }));

  const currentSection = SECTIONS[stepIndex];
  const isLastStep = stepIndex === SECTIONS.length - 1;

  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / SECTIONS.length) * 100),
    [stepIndex]
  );

  const resetForm = () => {
    setFormData(initialFormData);
    setLampiran({});
    setSignatures({ ortu: null, koordinator: null, relawan: null });
    setStepIndex(0);
    setSubmitted(false);
    setSendError("");
  };

  const submitToSheet = async () => {
    setSending(true);
    setSendError("");
    try {
      const lampiranBase64: Record<string, Base64File> = {};
      for (const [key, file] of Object.entries(lampiran)) {
        if (file) lampiranBase64[key] = await fileToBase64(file);
      }

      const payload = {
        ...formData, // field array (checkbox) dikirim apa adanya, Apps Script yang menggabungkan jadi teks
        tandaTanganOrtu: dataUrlToBase64(signatures.ortu),
        tandaTanganKoordinator: dataUrlToBase64(signatures.koordinator),
        tandaTanganRelawan: dataUrlToBase64(signatures.relawan),
        ...lampiranBase64, // fotoAnak, fotoRumah, ijazahRapor, kk, ktpOrtu, aktaLahir
      };

      const res = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // hindari CORS preflight ke Apps Script
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => null);
      if (result && result.status === "error")
        throw new Error(result.message || "Gagal menyimpan data.");

      setSubmitted(true);
    } catch (err) {
      setSendError(
        "Gagal mengirim ke Google Sheet. Periksa koneksi atau GOOGLE_SHEET_WEB_APP_URL. Kamu tetap bisa mengunduh data sebagai JSON."
      );
    } finally {
      setSending(false);
    }
  };

  const goNext = () => {
    if (isLastStep) {
      submitToSheet();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, SECTIONS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const downloadJSON = () => {
    const payload = {
      ...formData,
      lampiran: Object.fromEntries(
        Object.entries(lampiran).map(([k, v]) => [k, v?.name || null])
      ),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ATS_${formData.namaLengkap || "data"}.json`.replace(
      /\s+/g,
      "_"
    );
    a.click();
    URL.revokeObjectURL(url);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
            <Check className="text-teal-700" size={22} />
          </div>
          <h2 className="text-lg font-semibold text-stone-900">
            Data ATS tersimpan ke Google Sheet
          </h2>
          <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">
            Data untuk{" "}
            <span className="font-medium text-stone-700">
              {formData.namaLengkap || "anak"}
            </span>{" "}
            berhasil dikirim. Kamu juga bisa mengunduh salinannya sebagai JSON.
          </p>
          <div className="flex flex-col gap-2 mt-6">
            {onGoToData && (
              <button
                onClick={() => {
                  resetForm();
                  onGoToData();
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-teal-700 text-white px-4 py-2.5 text-sm font-medium hover:bg-teal-800 transition"
              >
                <Users size={15} /> Lihat Data ATS
              </button>
            )}
            <button
              onClick={downloadJSON}
              className="flex items-center justify-center gap-2 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              <Download size={15} /> Unduh data (JSON)
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              Isi data baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">
            Dinas Pendidikan Kab. Jeneponto
          </p>
          <h1 className="text-lg sm:text-xl font-semibold text-stone-900 mt-0.5">
            Instrumen Validasi Anak Tidak Sekolah (ATS)
          </h1>
          {/* Progress */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Section pills - scrollable */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {SECTIONS.map((s, i) => {
              const Icon = s.icon;
              const active = i === stepIndex;
              const done = i < stepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => setStepIndex(i)}
                  className={`flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                    active
                      ? "bg-teal-700 text-white"
                      : done
                      ? "bg-teal-50 text-teal-700"
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  }`}
                >
                  <Icon size={12} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 sm:px-7">
          {["identitas", "a", "b", "c", "d", "e"].includes(
            currentSection.id
          ) && (
            <ATSFormFields
              formData={formData}
              set={set}
              sections={[currentSection.id]}
            />
          )}

          {currentSection.id === "f" && (
            <>
              <p className="text-xs text-stone-500 pt-4">
                Isi salah satu sesuai kondisi.
              </p>
              <FieldShell number={29} label="Nama Orang Tua/Wali">
                <TextInput
                  value={formData.namaOrangTuaWali}
                  onChange={set("namaOrangTuaWali")}
                />
              </FieldShell>
              <FieldShell label="Tanda Tangan Orang Tua/Wali">
                <SignaturePad
                  onChange={(dataUrl) =>
                    setSignatures((prev) => ({ ...prev, ortu: dataUrl }))
                  }
                />
              </FieldShell>
              <FieldShell
                number={30}
                label="Catatan Tambahan Relawan Pendidikan"
              >
                <TextArea
                  value={formData.catatanTambahan}
                  onChange={set("catatanTambahan")}
                  rows={3}
                />
              </FieldShell>
              <FieldShell label="Tempat, Tanggal Bulan Tahun">
                <TextInput
                  value={formData.tempatTanggal}
                  onChange={set("tempatTanggal")}
                  placeholder="cth. Sinjai, 8 Agustus 2026"
                />
              </FieldShell>
              <FieldShell label="Koordinator Organisasi Mitra — Nama">
                <TextInput
                  value={formData.koordinatorNama}
                  onChange={set("koordinatorNama")}
                />
              </FieldShell>
              <FieldShell label="Koordinator Organisasi Mitra — Jabatan">
                <TextInput
                  value={formData.koordinatorJabatan}
                  onChange={set("koordinatorJabatan")}
                />
              </FieldShell>
              <FieldShell label="Tanda Tangan Koordinator (stempel)">
                <SignaturePad
                  onChange={(dataUrl) =>
                    setSignatures((prev) => ({ ...prev, koordinator: dataUrl }))
                  }
                />
              </FieldShell>
              <FieldShell label="Relawan — Nama">
                <TextInput
                  value={formData.relawanNamaTtd}
                  onChange={set("relawanNamaTtd")}
                />
              </FieldShell>
              <FieldShell label="Tanda Tangan Relawan">
                <SignaturePad
                  onChange={(dataUrl) =>
                    setSignatures((prev) => ({ ...prev, relawan: dataUrl }))
                  }
                />
              </FieldShell>
            </>
          )}

          {currentSection.id === "lampiran" && (
            <div className="py-4">
              <p className="text-xs text-stone-500 mb-3">
                Sesuai dengan ketersediaan dokumen yang dimiliki.
              </p>
              <div className="flex flex-col gap-2">
                {LAMPIRAN_ITEMS.map((item) => (
                  <LampiranUpload
                    key={item.key}
                    item={item}
                    file={lampiran[item.key]}
                    onChange={setLampiranFile(item.key)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pesan error kirim */}
        {sendError && (
          <div className="flex items-start gap-2 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{sendError}</span>
          </div>
        )}

        {/* Navigasi */}
        <div className="flex items-center justify-between mt-5 gap-3">
          <button
            onClick={goPrev}
            disabled={stepIndex === 0 || sending}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition"
          >
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          <span className="text-xs text-stone-400 tabular-nums">
            {stepIndex + 1} / {SECTIONS.length}
          </span>
          <button
            onClick={goNext}
            disabled={sending}
            className="flex items-center gap-1.5 rounded-lg bg-teal-700 text-white px-4 py-2.5 text-sm font-medium hover:bg-teal-800 disabled:opacity-60 transition"
          >
            {sending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                {isLastStep ? "Kirim & Simpan" : "Selanjutnya"}
                {!isLastStep && <ChevronRight size={16} />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  BAGIAN 2 — VIEWER DATA (DataATSApp)                                 */
/* ==================================================================== */

/* ------------------------------------------------------------------ *
 *  Kolom persis dari sheet "Data ATS" (baris 2 = header key)
 * ------------------------------------------------------------------ */
const FIELD_GROUPS = [
  {
    title: "Identitas Anak",
    fields: [
      ["namaLengkap", "Nama Lengkap"],
      ["nik", "NIK"],
      ["tempatLahir", "Tempat Lahir"],
      ["tanggalLahir", "Tanggal Lahir"],
      ["jenisKelamin", "Jenis Kelamin"],
      ["usiaATS", "Usia"],
      ["namaIbuKandung", "Nama Ibu Kandung"],
      ["alamatTinggal", "Alamat Tinggal"],
      ["agama", "Agama"],
      ["agamaLainnya", "Agama Lainnya"],
      ["statusAnak", "Status Anak"],
    ],
  },
  {
    title: "Kondisi Anak",
    fields: [
      ["kondisiFisikMental", "Kondisi Fisik / Mental"],
      ["kondisiFisikMentalKeterangan", "Keterangan Kondisi"],
    ],
  },
  {
    title: "Riwayat Pendidikan",
    fields: [
      ["pernahBersekolah", "Pernah Bersekolah"],
      ["pernahBersekolahLTM", "Terakhir Bersekolah"],
      ["jenjangKategori", "Jenjang Kategori"],
      ["jenjangTingkat", "Jenjang / Tingkat"],
      ["nisn", "NISN"],
      ["npsn", "NPSN Sekolah Terakhir"],
      ["namaSekolahTerakhir", "Nama Sekolah Terakhir"],
      ["tahunLulusPutus", "Tahun Lulus / Putus"],
      ["alasanTidakSekolah", "Alasan Tidak Sekolah"],
      ["alasanTidakSekolahLainnya", "Alasan Lainnya"],
    ],
  },
  {
    title: "Data Keluarga",
    fields: [
      ["kondisiOrangTua", "Kondisi Orang Tua"],
      ["tinggalDenganSiapa", "Tinggal Dengan"],
      ["namaOrangTuaWali", "Nama Orang Tua / Wali"],
      ["pekerjaanAyah", "Pekerjaan Ayah"],
      ["pekerjaanIbu", "Pekerjaan Ibu"],
      ["pekerjaanWali", "Pekerjaan Wali"],
      ["penghasilanKeluarga", "Penghasilan Keluarga"],
    ],
  },
  {
    title: "Bantuan Sosial",
    fields: [
      ["bantuanSosialKeluarga", "Bantuan Sosial Keluarga"],
      ["bantuanSosialKeluargaLainnya", "Bantuan Keluarga Lainnya"],
      ["bantuanSosialAnak", "Bantuan Sosial Anak"],
      ["bantuanSosialAnakJenis", "Jenis Bantuan Anak"],
    ],
  },
  {
    title: "Tempat Tinggal & Lingkungan",
    fields: [
      ["kondisiTempatTinggal", "Kondisi Tempat Tinggal"],
      ["kondisiTempatTinggalLainnya", "Kondisi Lainnya"],
      ["satuanPendidikanTerdekat", "Satuan Pendidikan Terdekat"],
      ["satuanPendidikanTerdekatLainnya", "Satuan Pendidikan Lainnya"],
    ],
  },
  {
    title: "Minat & Rencana Reintegrasi",
    fields: [
      ["minatBakat", "Minat & Bakat"],
      ["minatBakatLainnya", "Minat & Bakat Lainnya"],
      ["kesiapanKembaliBersekolah", "Kesiapan Kembali Bersekolah"],
      ["saranJalurReintegrasi", "Saran Jalur Reintegrasi"],
      ["saranJalurReintegrasiLainnya", "Saran Lainnya"],
    ],
  },
  {
    title: "Data Pendataan",
    fields: [
      ["timestampSubmit", "Waktu Submit"],
      ["tanggalPendataan", "Tanggal Pendataan"],
      ["namaRelawan", "Nama Relawan"],
      ["emailRelawan", "Email Relawan"],
      ["organisasiMitra", "Organisasi Mitra"],
      ["kabupatenKota", "Kabupaten / Kota"],
      ["kecamatan", "Kecamatan"],
      ["desaKelurahan", "Desa / Kelurahan"],
      ["tempatTanggal", "Tempat, Tanggal"],
      ["koordinatorNama", "Nama Koordinator"],
      ["koordinatorJabatan", "Jabatan Koordinator"],
    ],
  },
  {
    title: "Catatan",
    fields: [
      ["catatanTambahan", "Catatan Tambahan"],
      ["relawanNamaTtd", "Nama Ttd Relawan"],
    ],
  },
];

const DOCUMENT_FIELDS = [
  ["fotoAnakUrl", "Foto Anak"],
  ["fotoRumahUrl", "Foto Rumah"],
  ["ijazahRaporUrl", "Ijazah / Rapor"],
  ["kkUrl", "Kartu Keluarga"],
  ["ktpOrtuUrl", "KTP Orang Tua"],
  ["aktaLahirUrl", "Akta Lahir"],
  ["tandaTanganOrtuUrl", "Ttd Orang Tua"],
  ["tandaTanganKoordinatorUrl", "Ttd Koordinator"],
  ["tandaTanganRelawanUrl", "Ttd Relawan"],
];

const REINTEGRASI_STEPS = [
  "Terdata",
  "Diverifikasi",
  "Rencana Disusun",
  "Kembali Bersekolah",
];

// Field checkbox (array) yang di sheet disimpan sebagai teks gabungan " ; "
const ARRAY_FIELD_KEYS = [
  "alasanTidakSekolah",
  "kondisiTempatTinggal",
  "satuanPendidikanTerdekat",
  "minatBakat",
  "saranJalurReintegrasi",
];

/* ------------------------------------------------------------------ *
 *  Helper
 * ------------------------------------------------------------------ */
function reintegrasiStepIndex(record: Record<string, any>) {
  const val = (record.kesiapanKembaliBersekolah || "").toLowerCase();
  if (val.includes("sudah kembali")) return 3;
  if (val.includes("siap") || val.includes("rencana")) return 2;
  if (val.includes("butuh") || val.includes("belum siap")) return 1;
  return 0;
}

function initials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ------------------------------------------------------------------ *
 *  Komponen: DataATSApp
 *  defaultUrl: Web App URL Apps Script (dari GOOGLE_SHEET_WEB_APP_URL)
 * ------------------------------------------------------------------ */
function buildUrl(baseUrl: string, params: Record<string, string>) {
  if (!baseUrl) return baseUrl;
  const sep = baseUrl.includes("?") ? "&" : "?";
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return `${baseUrl}${sep}${query}`;
}

interface DataATSAppProps {
  defaultUrl: string;
}

function DataATSApp({ defaultUrl }: DataATSAppProps) {
  const [scriptUrl, setScriptUrl] = useState(defaultUrl || "");
  const [urlInput, setUrlInput] = useState(defaultUrl || "");
  const [records, setRecords] = useState<Record<string, any>[]>([]);
  const [usingSample, setUsingSample] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [kabFilter, setKabFilter] = useState("Semua");
  const [kecamatanFilter, setKecamatanFilter] = useState("Semua");

  const [selected, setSelected] = useState<Record<string, any> | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [editData, setEditData] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const loadData = useCallback(async (url: string) => {
    if (!url) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(buildUrl(url, { mode: "list" }));
      if (!res.ok) throw new Error("Status " + res.status);
      const json = await res.json();
      if (json && json.status === "error")
        throw new Error(json.message || "Gagal memuat data.");
      const rows = Array.isArray(json) ? json : json.data || [];
      if (!Array.isArray(rows)) throw new Error("Format data tidak dikenali");
      setRecords(rows);
      setUsingSample(false);
    } catch (e: any) {
      setError(
        "Gagal memuat data dari Apps Script (" +
          (e && e.message ? e.message : "kesalahan tidak diketahui") +
          ")."
      );
      setRecords([]);
      setUsingSample(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const openDetail = useCallback(
    async (row: Record<string, any>) => {
      setSelected(row); // tampilkan drawer segera pakai data ringan (nama, kab, kec)
      setEditData(null);
      setSaveError("");
      setDetailError("");
      setDetailLoading(true);
      try {
        const res = await fetch(
          buildUrl(scriptUrl, { mode: "detail", id: row.id })
        );
        if (!res.ok) throw new Error("Status " + res.status);
        const json = await res.json();
        if (json && json.status === "error")
          throw new Error(json.message || "Gagal memuat detail data.");
        setSelected(json.data || json);
      } catch (e: any) {
        setDetailError(
          "Gagal memuat detail data (" +
            (e && e.message ? e.message : "kesalahan tidak diketahui") +
            ")."
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [scriptUrl]
  );

  const closeDrawer = () => {
    setSelected(null);
    setEditData(null);
    setSaveError("");
    setDetailError("");
  };

  const startEdit = () => {
    if (!selected) return;
    const data: Record<string, any> = { ...selected };
    ARRAY_FIELD_KEYS.forEach((key) => {
      data[key] =
        typeof data[key] === "string" && data[key]
          ? data[key]
              .split(" ; ")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : Array.isArray(data[key])
          ? data[key]
          : [];
    });
    setEditData(data);
    setSaveError("");
  };

  const cancelEdit = () => {
    setEditData(null);
    setSaveError("");
  };

  const setEditField = (key: string) => (value: any) =>
    setEditData((prev) => (prev ? { ...prev, [key]: value } : prev));

  const saveEdit = async () => {
    if (!selected || !editData) return;
    setSaving(true);
    setSaveError("");
    try {
      const payload = { action: "update", id: selected.id, ...editData };
      const res = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => null);
      if (result && result.status === "error")
        throw new Error(result.message || "Gagal menyimpan perubahan.");

      const updated: Record<string, any> = { ...selected, ...editData };
      ARRAY_FIELD_KEYS.forEach((key) => {
        if (Array.isArray(updated[key])) {
          updated[key] = updated[key].join(" ; ");
        }
      });
      setRecords((prev) =>
        prev.map((r) => (r.id === selected.id ? updated : r))
      );
      setSelected(updated);
      setEditData(null);
    } catch (err: any) {
      setSaveError(
        "Gagal menyimpan ke Google Sheet (" +
          (err && err.message ? err.message : "kesalahan tidak diketahui") +
          ")."
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (scriptUrl) loadData(scriptUrl);
  }, [scriptUrl, loadData]);

  const kabupatenOptions = useMemo(() => {
    const set = new Set(records.map((r) => r.kabupatenKota).filter(Boolean));
    return ["Semua", ...Array.from(set).sort()];
  }, [records]);

  const kecamatanOptions = useMemo(() => {
    const relevant =
      kabFilter === "Semua"
        ? records
        : records.filter((r) => r.kabupatenKota === kabFilter);
    const set = new Set(relevant.map((r) => r.kecamatan).filter(Boolean));
    return ["Semua", ...Array.from(set).sort()];
  }, [records, kabFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (kabFilter !== "Semua" && r.kabupatenKota !== kabFilter) return false;
      if (kecamatanFilter !== "Semua" && r.kecamatan !== kecamatanFilter)
        return false;
      if (!q) return true;
      const hay = [
        r.namaLengkap,
        r.nik,
        r.desaKelurahan,
        r.kecamatan,
        r.namaOrangTuaWali,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [records, search, kabFilter, kecamatanFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const kembali = filtered.filter((r) =>
      (r.kesiapanKembaliBersekolah || "")
        .toLowerCase()
        .includes("sudah kembali")
    ).length;
    const wilayah = new Set(
      filtered.map((r) => r.kabupatenKota).filter(Boolean)
    ).size;
    return { total, kembali, wilayah };
  }, [filtered]);

  // Sebaran per kecamatan, hanya relevan saat satu kabupaten dipilih.
  // Sengaja mengabaikan kecamatanFilter agar grafik tetap menampilkan
  // perbandingan semua kecamatan dalam kabupaten tsb, bukan cuma 1 batang.
  const kecamatanChartData = useMemo(() => {
    if (kabFilter === "Semua") return [];
    const q = search.trim().toLowerCase();
    const relevant = records.filter((r) => {
      if (r.kabupatenKota !== kabFilter) return false;
      if (!q) return true;
      const hay = [
        r.namaLengkap,
        r.nik,
        r.desaKelurahan,
        r.kecamatan,
        r.namaOrangTuaWali,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    const counts: Record<string, number> = {};
    relevant.forEach((r) => {
      const key = r.kecamatan || "(Tidak diketahui)";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([kecamatan, jumlah]) => ({ kecamatan, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah);
  }, [records, kabFilter, search]);

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .ats-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .ats-scroll::-webkit-scrollbar-thumb { background: #D8CDB8; border-radius: 4px; }
        .ats-card { transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
        .ats-card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -12px rgba(31,75,67,0.35); border-color: #1F4B43 !important; }
        .ats-btn:active { transform: scale(0.97); }
      `}</style>

      {/* ---------- Header ---------- */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.brandMark}>
            <Sprout size={22} color="#FAF7F2" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.eyebrow}>DATA ATS · BIDANG PAUD</div>
            <h1 style={styles.title}>Anak Tidak Sekolah</h1>
          </div>
          <button
            className="ats-btn"
            onClick={() => {
              setShowConfig((s) => !s);
              setUrlInput(scriptUrl);
            }}
            style={styles.iconBtn}
            aria-label="Pengaturan sumber data"
          >
            <Link2 size={17} color="#FAF7F2" />
          </button>
          <button
            className="ats-btn"
            onClick={() => loadData(scriptUrl)}
            style={styles.iconBtn}
            aria-label="Muat ulang data"
          >
            <RefreshCw
              size={16}
              color="#FAF7F2"
              className={loading ? "spin" : ""}
            />
          </button>
        </div>

        {showConfig && (
          <div style={styles.configPanel}>
            <label style={styles.configLabel}>
              URL Web App Google Apps Script
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/…/exec"
                style={styles.configInput}
              />
              <button
                className="ats-btn"
                onClick={() => setScriptUrl(urlInput.trim())}
                style={styles.configBtn}
                disabled={!urlInput.trim() || loading}
              >
                {loading ? (
                  <RefreshCw size={15} className="spin" />
                ) : (
                  "Muat Data"
                )}
              </button>
            </div>
            <p style={styles.configHint}>
              Endpoint <code>doGet()</code> di Code.gs mengembalikan JSON{" "}
              <code>{"{ data: [...] }"}</code> dengan key persis seperti baris 2
              pada sheet "Data ATS" (namaLengkap, nik, kabupatenKota, dst).
            </p>
          </div>
        )}
      </header>

      {/* ---------- Status banner ---------- */}
      {error && (
        <div style={styles.banner}>
          <AlertCircle size={15} color="#8A5A15" style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* ---------- Stats ---------- */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <Users size={16} color="#1F4B43" />
          <div>
            <div style={styles.statNum}>{stats.total}</div>
            <div style={styles.statLabel}>Anak Terdata</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <Sprout size={16} color="#1F4B43" />
          <div>
            <div style={styles.statNum}>{stats.kembali}</div>
            <div style={styles.statLabel}>Sudah Kembali Sekolah</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <MapPin size={16} color="#1F4B43" />
          <div>
            <div style={styles.statNum}>{stats.wilayah}</div>
            <div style={styles.statLabel}>Kabupaten/Kota</div>
          </div>
        </div>
      </div>

      {/* ---------- Search & filter ---------- */}
      <div style={styles.filterRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#8A8071" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama"
            style={styles.searchInput}
          />
        </div>
        <select
          value={kabFilter}
          onChange={(e) => {
            setKabFilter(e.target.value);
            setKecamatanFilter("Semua");
          }}
          style={styles.select}
        >
          {kabupatenOptions.map((k) => (
            <option key={k} value={k}>
              {k === "Semua" ? "Semua Kab/Kota" : k}
            </option>
          ))}
        </select>
        <select
          value={kecamatanFilter}
          onChange={(e) => setKecamatanFilter(e.target.value)}
          style={styles.select}
        >
          {kecamatanOptions.map((k) => (
            <option key={k} value={k}>
              {k === "Semua" ? "Semua Kecamatan" : k}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Grafik per Kecamatan ---------- */}
      {kabFilter !== "Semua" && kecamatanChartData.length > 0 && (
        <section style={styles.chartSection}>
          <h3 style={styles.chartTitle}>
            <BarChart3
              size={14}
              style={{ verticalAlign: "-2px", marginRight: 6 }}
            />
            Sebaran per Kecamatan — {kabFilter}
          </h3>
          <div style={styles.chartBars}>
            {kecamatanChartData.map((d) => {
              const max = kecamatanChartData[0].jumlah;
              const widthPct = max > 0 ? (d.jumlah / max) * 100 : 0;
              return (
                <div key={d.kecamatan} style={styles.chartRow}>
                  <span style={styles.chartLabel}>{d.kecamatan}</span>
                  <div style={styles.chartTrack}>
                    <div
                      style={{ ...styles.chartFill, width: `${widthPct}%` }}
                    />
                  </div>
                  <span style={styles.chartValue}>{d.jumlah}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- List ---------- */}
      <main style={styles.list} className="ats-scroll">
        {loading && (
          <div style={styles.emptyState}>
            <RefreshCw size={20} color="#1F4B43" className="spin" />
            <p>Memuat data…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={styles.emptyState}>
            <Users size={22} color="#B9AF9A" />
            <p>
              {records.length === 0
                ? "Belum ada data yang tersimpan di Google Sheet."
                : "Tidak ada data yang cocok dengan pencarian/filter ini."}
            </p>
          </div>
        )}

        {!loading &&
          filtered.map((r) => {
            return (
              <button
                key={r.id || r.nik || r.namaLengkap}
                className="ats-card"
                onClick={() => openDetail(r)}
                style={styles.card}
              >
                <div style={styles.avatar}>{initials(r.namaLengkap)}</div>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div style={styles.cardName}>
                    {r.namaLengkap || "(tanpa nama)"}
                  </div>
                  <div style={styles.cardMetaSmall}>
                    <MapPin size={11} style={{ verticalAlign: "-1px" }} />{" "}
                    {[r.kecamatan, r.kabupatenKota]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  color="#B9AF9A"
                  style={{ flexShrink: 0 }}
                />
              </button>
            );
          })}
      </main>

      {/* ---------- Detail drawer ---------- */}
      {selected && (
        <div style={styles.overlay} onClick={closeDrawer}>
          <div
            style={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            className="ats-scroll"
          >
            <div style={styles.drawerHeader}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    ...styles.avatar,
                    width: 40,
                    height: 40,
                    fontSize: 14,
                  }}
                >
                  {initials(selected.namaLengkap)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={styles.drawerName}>{selected.namaLengkap}</div>
                  <div style={styles.drawerSub}>
                    {[selected.kecamatan, selected.kabupatenKota]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {!editData && (
                  <button
                    className="ats-btn"
                    onClick={startEdit}
                    disabled={detailLoading}
                    style={{
                      ...styles.editBtn,
                      opacity: detailLoading ? 0.5 : 1,
                    }}
                  >
                    <PenLine size={13} /> Edit
                  </button>
                )}
                <button
                  className="ats-btn"
                  onClick={closeDrawer}
                  style={styles.closeBtn}
                  aria-label="Tutup"
                >
                  <X size={18} color="#4A4234" />
                </button>
              </div>
            </div>

            <div style={styles.drawerBody}>
              {detailError && (
                <div style={styles.saveErrorBox}>
                  <AlertCircle
                    size={14}
                    color="#B3261E"
                    style={{ flexShrink: 0 }}
                  />
                  <span>{detailError}</span>
                </div>
              )}

              {saveError && (
                <div style={styles.saveErrorBox}>
                  <AlertCircle
                    size={14}
                    color="#B3261E"
                    style={{ flexShrink: 0 }}
                  />
                  <span>{saveError}</span>
                </div>
              )}

              {detailLoading ? (
                <div style={styles.emptyState}>
                  <RefreshCw size={20} color="#1F4B43" className="spin" />
                  <p>Memuat detail data…</p>
                </div>
              ) : editData ? (
                <div className="bg-white rounded-2xl">
                  <ATSFormFields
                    formData={editData}
                    set={setEditField}
                    sections={["identitas", "a", "b", "c", "d", "e", "f"]}
                  />
                </div>
              ) : (
                FIELD_GROUPS.map((group) => {
                  const visible = group.fields.filter(([key]) => selected[key]);
                  if (visible.length === 0) return null;
                  return (
                    <section key={group.title} style={styles.section}>
                      <h3 style={styles.sectionTitle}>{group.title}</h3>
                      <dl style={styles.dl}>
                        {visible.map(([key, label]) => (
                          <div key={key} style={styles.dlRow}>
                            <dt style={styles.dt}>{label}</dt>
                            <dd style={styles.dd}>{String(selected[key])}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  );
                })
              )}

              {!editData && DOCUMENT_FIELDS.some(([key]) => selected[key]) && (
                <section style={styles.section}>
                  <h3 style={styles.sectionTitle}>Dokumen & Lampiran</h3>
                  <div style={styles.docGrid}>
                    {DOCUMENT_FIELDS.filter(([key]) => selected[key]).map(
                      ([key, label]) => (
                        <a
                          key={key}
                          href={selected[key]}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.docLink}
                        >
                          <FileText size={14} />
                          <span style={{ flex: 1 }}>{label}</span>
                          <ExternalLink size={13} />
                        </a>
                      )
                    )}
                  </div>
                </section>
              )}

              {editData && (
                <div style={styles.editActions}>
                  <button
                    className="ats-btn"
                    onClick={cancelEdit}
                    disabled={saving}
                    style={styles.cancelBtn}
                  >
                    Batal
                  </button>
                  <button
                    className="ats-btn"
                    onClick={saveEdit}
                    disabled={saving}
                    style={styles.saveBtn}
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={14} className="spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`.spin { animation: ats-spin 1s linear infinite; } @keyframes ats-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Style tokens (DataATSApp)
 * ------------------------------------------------------------------ */
const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: "#FAF7F2",
    minHeight: "100vh",
    color: "#2B2A22",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "linear-gradient(135deg, #1F4B43 0%, #163832 100%)",
    padding: "16px 16px 14px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerTop: { display: "flex", alignItems: "center", gap: 10 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "rgba(250,247,242,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: 10.5,
    letterSpacing: "0.14em",
    color: "#E8A33D",
    fontWeight: 700,
    marginBottom: 2,
  },
  title: {
    fontFamily: "'Lora', serif",
    fontSize: 19,
    fontWeight: 600,
    color: "#FAF7F2",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "rgba(250,247,242,0.14)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  configPanel: {
    marginTop: 12,
    background: "rgba(250,247,242,0.08)",
    border: "1px solid rgba(250,247,242,0.18)",
    borderRadius: 10,
    padding: 12,
  },
  configLabel: {
    fontSize: 11.5,
    color: "#D9E4E1",
    fontWeight: 600,
    marginBottom: 6,
    display: "block",
  },
  configInput: {
    flex: 1,
    minWidth: 180,
    padding: "9px 10px",
    borderRadius: 8,
    border: "1px solid rgba(250,247,242,0.25)",
    background: "rgba(250,247,242,0.95)",
    fontSize: 13,
    fontFamily: "inherit",
  },
  configBtn: {
    padding: "9px 14px",
    borderRadius: 8,
    border: "none",
    background: "#E8A33D",
    color: "#2B2205",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  configHint: {
    fontSize: 11,
    color: "#B9C9C4",
    marginTop: 8,
    marginBottom: 0,
    lineHeight: 1.5,
  },
  banner: {
    background: "#FBEBD0",
    borderBottom: "1px solid #EFD9A8",
    color: "#7A5411",
    fontSize: 12.5,
    padding: "9px 16px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    lineHeight: 1.4,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    padding: "14px 16px 4px",
  },
  statCard: {
    background: "#FFFFFF",
    border: "1px solid #E4DDD1",
    borderRadius: 12,
    padding: "10px 10px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  statNum: {
    fontSize: 17,
    fontWeight: 700,
    fontFamily: "'Lora', serif",
    lineHeight: 1.1,
  },
  statLabel: { fontSize: 10, color: "#7A7263", lineHeight: 1.3, marginTop: 2 },
  filterRow: {
    display: "flex",
    gap: 8,
    padding: "10px 16px",
    flexWrap: "wrap",
  },
  chartSection: {
    margin: "4px 16px 0",
    background: "#FFFFFF",
    border: "1px solid #E4DDD1",
    borderRadius: 12,
    padding: "12px 14px 14px",
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1F4B43",
    margin: "0 0 10px",
    display: "flex",
    alignItems: "center",
  },
  chartBars: { display: "flex", flexDirection: "column", gap: 7 },
  chartRow: { display: "flex", alignItems: "center", gap: 8 },
  chartLabel: {
    fontSize: 11.5,
    color: "#4A4234",
    width: 108,
    flexShrink: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  chartTrack: {
    flex: 1,
    height: 10,
    borderRadius: 6,
    background: "#EFEAE0",
    overflow: "hidden",
  },
  chartFill: {
    height: "100%",
    borderRadius: 6,
    background: "linear-gradient(90deg, #1F4B43, #2C6E62)",
    transition: "width .25s ease",
  },
  chartValue: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#1F4B43",
    width: 22,
    textAlign: "right",
    flexShrink: 0,
  },
  searchBox: {
    flex: "1 1 180px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#FFFFFF",
    border: "1px solid #E4DDD1",
    borderRadius: 10,
    padding: "9px 12px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 13.5,
    flex: 1,
    fontFamily: "inherit",
    background: "transparent",
    color: "#2B2A22",
  },
  select: {
    border: "1px solid #E4DDD1",
    borderRadius: 10,
    padding: "9px 10px",
    fontSize: 13,
    fontFamily: "inherit",
    background: "#FFFFFF",
    color: "#2B2A22",
    flex: "1 1 130px",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "4px 16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  emptyState: {
    textAlign: "center",
    color: "#8A8071",
    fontSize: 13,
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#FFFFFF",
    border: "1px solid #E4DDD1",
    borderRadius: 14,
    padding: "12px 14px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#EAF2F0",
    color: "#1F4B43",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
  },
  cardName: { fontSize: 14.5, fontWeight: 700, color: "#20261F" },
  cardMeta: { fontSize: 12, color: "#5A5647", marginTop: 1 },
  cardMetaSmall: { fontSize: 11, color: "#8A8071", marginTop: 2 },
  stepper: { display: "flex", alignItems: "center", gap: 4, marginTop: 7 },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    display: "inline-block",
  },
  stepText: {
    fontSize: 10.5,
    color: "#5A5647",
    marginLeft: 4,
    fontWeight: 600,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(20,25,20,0.45)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 50,
  },
  drawer: {
    background: "#FAF7F2",
    width: "min(420px, 100%)",
    height: "100%",
    overflowY: "auto",
    boxShadow: "-12px 0 32px rgba(0,0,0,0.18)",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom: "1px solid #E4DDD1",
    background: "#FFFFFF",
    position: "sticky",
    top: 0,
  },
  drawerName: { fontSize: 15.5, fontWeight: 700, fontFamily: "'Lora', serif" },
  drawerSub: { fontSize: 11.5, color: "#8A8071", marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #E4DDD1",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  drawerBody: { padding: "14px 16px 32px" },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11.5,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#1F4B43",
    fontWeight: 700,
    marginBottom: 8,
    borderBottom: "1px solid #E4DDD1",
    paddingBottom: 6,
  },
  dl: { margin: 0, display: "flex", flexDirection: "column", gap: 7 },
  dlRow: { display: "flex", flexDirection: "column", gap: 1 },
  dt: { fontSize: 10.5, color: "#8A8071", fontWeight: 600 },
  dd: { fontSize: 13, color: "#2B2A22", margin: 0, lineHeight: 1.4 },
  docGrid: { display: "flex", flexDirection: "column", gap: 6 },
  docLink: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 11px",
    borderRadius: 9,
    border: "1px solid #E4DDD1",
    background: "#FFFFFF",
    fontSize: 12.5,
    color: "#1F4B43",
    textDecoration: "none",
    fontWeight: 600,
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 11px",
    borderRadius: 8,
    border: "1px solid #1F4B43",
    background: "#EAF2F0",
    color: "#1F4B43",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  saveErrorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 7,
    background: "#FBEAEA",
    border: "1px solid #F0C6C6",
    borderRadius: 9,
    padding: "9px 11px",
    fontSize: 12,
    color: "#8A2020",
    marginBottom: 14,
  },
  editGrid: { display: "flex", flexDirection: "column", gap: 10 },
  editRow: { display: "flex", flexDirection: "column", gap: 4 },
  editInput: {
    border: "1px solid #E4DDD1",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    fontFamily: "inherit",
    color: "#2B2A22",
    background: "#FFFFFF",
  },
  editTextarea: {
    border: "1px solid #E4DDD1",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    fontFamily: "inherit",
    color: "#2B2A22",
    background: "#FFFFFF",
    resize: "vertical",
  },
  editActions: {
    display: "flex",
    gap: 8,
    marginTop: 8,
    position: "sticky",
    bottom: 0,
    background: "#FAF7F2",
    paddingTop: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 9,
    border: "1px solid #E4DDD1",
    background: "#FFFFFF",
    color: "#4A4234",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  saveBtn: {
    flex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "10px 0",
    borderRadius: 9,
    border: "none",
    background: "#1F4B43",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
};

/* ==================================================================== */
/*  BAGIAN 3 — APP SHELL: tab navigasi Input Data ⇄ Lihat Data          */
/* ==================================================================== */

export default function AppATS() {
  const [tab, setTab] = useState<"input" | "data">("input");

  return (
    <div>
      <nav className="flex items-center gap-1.5 bg-white border-b border-stone-200 px-3 sm:px-6 py-2">
        <button
          onClick={() => setTab("input")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
            tab === "input"
              ? "bg-teal-700 text-white"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <ClipboardList size={15} /> Input Data
        </button>
        <button
          onClick={() => setTab("data")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
            tab === "data"
              ? "bg-teal-700 text-white"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Users size={15} /> Lihat Data
        </button>
      </nav>

      {tab === "input" ? (
        <FormValidasiATS onGoToData={() => setTab("data")} />
      ) : (
        <DataATSApp defaultUrl={GOOGLE_SHEET_WEB_APP_URL} />
      )}
    </div>
  );
}
