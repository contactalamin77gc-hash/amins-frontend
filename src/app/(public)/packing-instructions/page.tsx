export default function PackingInstructionsPage() {
  return (
    <section className="max-w-[1180px] mx-auto px-6 py-16">
      <span className="text-kicker text-brand">Guidelines</span>
      <h1 className="text-section-title text-brand-ink mt-3 mb-10">
        Packing Instructions / প্যাকিং এর নির্দেশাবলি
      </h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* English */}
        <div>
          <h2 className="text-xl font-display text-brand-ink mb-6 pb-3 border-b-2 border-brand">
            Packing Instructions <span className="text-sm font-normal text-gray-label">(English)</span>
          </h2>
          <ol className="space-y-5 list-none">
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">1</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                All types of products must be packed according to the packing instructions provided.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">2</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                All general products must be packed in cartons, then wrapped with green woven poly bags, and the shipping mark provided by Amin&apos;s must be printed and attached on top of the green woven poly bag. If possible, the packing list should also be attached to the side of the carton.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">3</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                For special category products — liquids, batteries, machinery, and items marked as fragile — that may break or leak, they must be packed in wooden crates. The fragile mark and shipping mark provided by Amin&apos;s must be attached on the outside.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">4</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                After inspecting your products, if Amin&apos;s authority provides any additional packing directions, you must pack accordingly.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">5</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                If any re-packing is required at Amin&apos;s warehouse, Amin&apos;s authority will not be responsible for any lost or damaged goods during the process.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">6</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                Before the products arrive at Amin&apos;s warehouse, a 100% complete and proper packing list must be provided to the Amin&apos;s team. If the packing list is not provided, Amin&apos;s authority will not be responsible for any lost, damaged, or unshipped goods.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">7</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                If your products are not packed according to these packing instructions, Amin&apos;s authority will not be responsible for any lost, damaged, or unshipped goods.
              </p>
            </li>
          </ol>
        </div>

        {/* Bangla */}
        <div>
          <h2 className="text-xl font-display text-brand-ink mb-6 pb-3 border-b-2 border-brand">
            প্যাকিং এর নির্দেশাবলি <span className="text-sm font-normal text-gray-label">(বাংলা)</span>
          </h2>
          <ol className="space-y-5 list-none">
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">১</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                যে কোনো ধরনের পণ্য অবশ্যই প্যাকিং দিকনির্দেশনা অনুযায়ী প্যাকিং করতে হবে।
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">২</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                সকল সাধারণ পণ্য অবশ্যই কার্টুনে প্যাকিং করে গ্রীন ওভেন পলি ব্যাগ দিয়ে রেসিং করে আমিন&apos;স হতে প্রদত্ত শিপিং মার্ক প্রিন্ট করে গ্রীন ওভেন পলি ব্যাগের উপর লাগিয়ে দিতে হবে। যদি সম্ভব হয়, প্যাকিং লিস্ট কার্টুন এর গায়ে লাগিয়ে দিলে ভালো হবে।
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">৩</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                বিশেষ ধরনের পণ্য তরল/ ব্যাটারি/ মেশিনারি এবং fragile mark যুক্ত পণ্য যা ভাঙা বা লিকেজ হয়ে যাওয়ার সম্ভাবনা থাকে তা অবশ্যই ওভেন বক্স করে দিতে হবে এবং গায়ের উপর fragile mark এবং আমিন&apos;স হতে প্রদত্ত শিপিং মার্ক লাগিয়ে দিতে হবে।
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">৪</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                আপনার পণ্য দেখার পর আমিন&apos;স কর্তৃপক্ষ যদি কোনো দিকনির্দেশনা দেয় তবে সে দিকনির্দেশনা অনুযায়ী প্যাকিং করে দিতে হবে।
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">৫</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                আমিন&apos;স ওয়্যারহাউস এ যদি কোনো রি-প্যাকিং করতে হয়, তখন কোনো পণ্য হারালে অথবা ক্ষতিগ্রস্ত হলে আমিন&apos;স কর্তৃপক্ষ তার দায়ভার গ্রহণ করবে না।
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">৬</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                পণ্য আমিন&apos;স এর ওয়্যারহাউজে পৌঁছানোর পূর্বেই, আমিন&apos;স টিমকে ১০০% প্রপার প্যাকিং লিস্ট প্রদান করতে হবে, যদি প্রদান না করেন, আপনার পণ্য হারানো অথবা ক্ষতিগ্রস্ত অথবা শিপমেন্ট করা না হলে আমিন&apos;স কর্তৃপক্ষ এর দায়ভার গ্রহণ করবে না।
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center shrink-0 text-xs font-bold">৭</span>
              <p className="text-sm text-brand-ink leading-relaxed">
                উক্ত প্যাকিং নির্দেশনা বাতীত আপনার পণ্য প্যাকিং করা না হলে, আপনার পণ্য হারানো অথবা ক্ষতিগ্রস্ত অথবা শিপমেন্ট করা না হলে আমিন&apos;স কর্তৃপক্ষ এর দায়ভার গ্রহণ করবে না।
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}