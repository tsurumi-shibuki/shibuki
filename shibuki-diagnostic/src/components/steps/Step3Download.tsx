import { useState } from 'react';
import { Calendar, Clock, Video, MapPin, User, Mail, Phone, FileText, CheckCircle2, Download } from 'lucide-react';
import type { BookingInfo, BookingConfirmation, OfficeInfo, DiagnosticScore, DiagnosisResult } from '../../types';
import { submitBooking } from '../../services/diagnosticApi';
import { getGradeColor, getGradeBg, getGradeEmoji } from '../../utils/scoring';

interface Props {
  officeInfo: OfficeInfo;
  scores: DiagnosticScore;
  diagnosis: DiagnosisResult | null;
  onDownload: () => void;
  onBookingComplete: (confirmation: BookingConfirmation) => void;
  bookingConfirmation: BookingConfirmation | null;
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function getAvailableDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  let count = 0;
  let d = new Date(today);
  d.setDate(d.getDate() + 2); // Start from 2 days out
  while (count < 14) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      dates.push(d.toISOString().split('T')[0]);
      count++;
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`;
}

export default function Step3Download({
  officeInfo,
  scores,
  diagnosis,
  onDownload,
  onBookingComplete,
  bookingConfirmation,
}: Props) {
  const [booking, setBooking] = useState<BookingInfo>({
    preferredDate: '',
    preferredTime: '',
    format: 'online',
    name: officeInfo.ownerName,
    email: officeInfo.email,
    phone: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableDates = getAvailableDates();
  const gradeColor = getGradeColor(scores.grade);
  const gradeBg = getGradeBg(scores.grade);

  const isBookingValid =
    booking.preferredDate !== '' &&
    booking.preferredTime !== '' &&
    booking.name.trim() !== '' &&
    booking.email.trim() !== '' &&
    booking.phone.trim() !== '';

  const handleSubmitAndDownload = async () => {
    if (!isBookingValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const confirmation = await submitBooking(booking, officeInfo, scores.overall);
      onBookingComplete(confirmation);
      // Trigger PDF download after booking
      setIsDownloading(true);
      await onDownload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'booking failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
      setIsDownloading(false);
    }
  };

  // If already booked, show confirmation + download
  if (bookingConfirmation) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        <div className="bg-green-50 border border-green-300 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-green-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-green-800 mb-2">面談予約が完了しました！</h2>
          <p className="text-sm text-green-700 mb-1">{bookingConfirmation.message}</p>
          <p className="text-xs text-green-600 mt-2">
            確認番号: <strong>{bookingConfirmation.confirmationNumber}</strong>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ご登録のメールアドレス（{officeInfo.email}）に確認メールをお送りします
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <FileText className="mx-auto mb-3 text-brand-500" size={32} />
          <h3 className="text-base font-bold text-gray-900 mb-2">診断レポートをダウンロード</h3>
          <p className="text-sm text-gray-500 mb-4">
            面談前に診断内容をご確認いただけます
          </p>
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-60"
          >
            <Download size={18} />
            {isDownloading ? 'PDF生成中...' : 'PDFレポートをダウンロード'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* ─── Score Summary ────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 border-2"
        style={{ backgroundColor: gradeBg, borderColor: gradeColor + '40' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{officeInfo.name} の診断スコア</p>
            <p className="text-3xl font-black tabular-nums mt-1" style={{ color: gradeColor }}>
              {scores.overall}
              <span className="text-lg text-gray-400 font-medium"> / 100</span>
            </p>
          </div>
          <div
            className="text-3xl font-black px-4 py-2 rounded-2xl text-white"
            style={{ backgroundColor: gradeColor }}
          >
            {getGradeEmoji(scores.grade)} {scores.grade}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ※ このレポートは面談予約後にダウンロードできます
        </p>
      </div>

      {/* ─── What's in the report ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <FileText size={16} className="text-brand-500" />
          診断レポートに含まれる内容
        </h3>
        <ul className="space-y-2">
          {[
            '総合スコア・Sランク〜Dランクの評価',
            'カテゴリ別レーダーチャート（業界平均との比較付き）',
            '強み3項目・改善課題3項目の詳細解説',
            '30日・3ヶ月・1年のアクションプラン',
            '業界ベンチマークコメント',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ─── Booking Form ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">
          無料報告面談のご予約
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          診断結果の読み解きと、貴事務所への具体的なアドバイスを無料でご提供します（約60分）
        </p>

        {/* Date Selection */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar size={15} className="text-brand-500" />
            ご希望の日付 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availableDates.slice(0, 8).map((date) => (
              <button
                key={date}
                onClick={() => setBooking({ ...booking, preferredDate: date })}
                className={`py-2 px-2 rounded-lg text-xs font-medium border-2 transition-all ${
                  booking.preferredDate === date
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-blue-50'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Clock size={15} className="text-brand-500" />
            ご希望の時間 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                onClick={() => setBooking({ ...booking, preferredTime: time })}
                className={`py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                  booking.preferredTime === time
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-blue-50'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            面談形式 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setBooking({ ...booking, format: 'online' })}
              className={`flex items-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                booking.format === 'online'
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-brand-300'
              }`}
            >
              <Video size={16} />
              オンライン（Zoom等）
            </button>
            <button
              onClick={() => setBooking({ ...booking, format: 'inperson' })}
              className={`flex items-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                booking.format === 'inperson'
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-brand-300'
              }`}
            >
              <MapPin size={16} />
              対面（事務所訪問）
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 mb-5">
          <h3 className="text-sm font-semibold text-gray-700">ご連絡先</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                <User size={13} />
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={booking.name}
                onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                <Phone size={13} />
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={booking.phone}
                onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                placeholder="00-0000-0000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
              <Mail size={13} />
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={booking.email}
              onChange={(e) => setBooking({ ...booking, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              面談前に伝えておきたいこと（任意）
            </label>
            <textarea
              value={booking.notes}
              onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
              rows={3}
              placeholder="特に相談したいテーマや課題があれば教えてください"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmitAndDownload}
          disabled={!isBookingValid || isSubmitting}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-base transition-all ${
            isBookingValid && !isSubmitting
              ? 'bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              予約処理中...
            </>
          ) : (
            <>
              <Calendar size={18} />
              面談を予約して PDFをダウンロード
              <Download size={18} />
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          ※ 無料面談です。強引な営業は一切いたしません。
        </p>
      </div>
    </div>
  );
}
