import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Public User Agreement / Terms page. Linked from the footer, the sign-up
 * page, and the admin event form (organizers must accept it to publish).
 */
export default function Terms() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto p-8 max-w-3xl">
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-3xl font-bold text-usmPurple">
              USM Evently — User Agreement
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: June 2026. By creating an account, registering for
              events, or publishing events, you agree to the rules below.
            </p>
          </CardHeader>
          <CardContent className="p-0 space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                1. Who can use USM Evently
              </h2>
              <p>
                USM Evently is a community platform for Universiti Sains
                Malaysia (USM) students, staff, and approved organisers. To keep
                the community safe and accountable, every account must register
                with a valid identification number — your{" "}
                <strong>matric number, IC, or passport</strong>. This
                information is used solely for verification and to trace
                fraudulent activity if necessary; it is never shown publicly.
                Providing false identification is grounds for an immediate,
                permanent block. You are responsible for keeping your account
                secure and for all activity under it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                2. Organiser responsibilities
              </h2>
              <p className="mb-2">
                When you create or open an event, you must provide complete and
                truthful information, including:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The organising <strong>school / faculty</strong> and the <strong>USM campus</strong> where it is held.</li>
                <li>The accurate <strong>date and time</strong> of the event.</li>
                <li>Whether the event is <strong>free for all</strong> or ticketed, and whether <strong>outsiders (non-USM visitors) are allowed</strong>.</li>
                <li>Any <strong>dress code</strong> and <strong>cultural or religious etiquette</strong> that visitors must observe and respect.</li>
                <li>A working <strong>organiser emergency helpline</strong> that attendees can reach during the event.</li>
                <li>An appropriate event <strong>poster</strong> (JPG or PNG, max 5 MB) that you have the rights to use.</li>
              </ul>
              <p className="mt-2">
                Organisers are responsible for the safety, lawfulness, and
                accuracy of their events and must comply with all USM policies
                and Malaysian law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                3. Visitor &amp; attendee conduct
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Follow the dress code and cultural guidelines stated on each event.</li>
                <li>Respect the campus, the organisers, fellow attendees, and USM property.</li>
                <li>Do not engage in harassment, discrimination, or any unlawful or unsafe behaviour.</li>
                <li>Follow the instructions of organisers and campus security at all times.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                4. Prohibited content
              </h2>
              <p>
                You may not post false, misleading, offensive, discriminatory,
                or unlawful content; impersonate others; upload posters you do
                not have the rights to; or use the platform to spam, scam, or
                endanger others.
              </p>
            </section>

            <section className="rounded-md border-l-4 border-usmPurple bg-purple-50 p-4">
              <h2 className="text-lg font-semibold text-usmPurple mb-2">
                5. Administrator rights &amp; enforcement
              </h2>
              <p className="mb-2">
                To keep the community safe, USM Evently administrators may, at
                their sole discretion and without prior notice:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Edit or permanently delete any event</strong> that contains inaccurate, unsafe, inappropriate, or rule-violating information.</li>
                <li><strong>Block any user account</strong> that breaches this agreement.</li>
                <li><strong>Block any email address</strong> (including Gmail or other addresses) from registering or signing in.</li>
                <li>Remove content and revoke organiser privileges.</li>
              </ul>
              <p className="mt-2">
                A blocked account or email address loses access to the platform
                and cannot register or log in again unless an administrator
                reverses the block.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                6. Payments
              </h2>
              <p>
                Ticketed events may use the built-in platform checkout (raw card
                details are never stored) or the organiser&apos;s own payment
                details (bank transfer, Touch &apos;n Go, or QR code). When you
                pay an organiser directly, that transaction is strictly between
                you and the organiser — verify the details and keep your
                receipt. Refunds, where applicable, are handled by the event
                organiser.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                7. Privacy
              </h2>
              <p>
                We store the information you provide (name, email, phone, and
                your event registrations) to operate the platform. We do not
                sell your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                8. Changes to this agreement
              </h2>
              <p>
                We may update this agreement from time to time. Continued use of
                USM Evently after changes means you accept the updated terms.
              </p>
            </section>

            <p className="text-sm text-gray-500 border-t pt-4">
              Questions? Contact us at info@usm.my.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
