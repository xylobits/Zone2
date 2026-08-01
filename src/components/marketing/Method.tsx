import { Reveal } from './Reveal';
import { MethodTabs } from './MethodTabs';

export function Method() {
  return (
    <section className="light pad" id="method">
      <div className="wrap">
        <Reveal as="div" className="head-row">
          <h2>
            Three systems.
            <br />
            One athlete.
          </h2>
          <p>
            Training, nutrition and community are usually three apps that never speak to each other. In Zone2 each
            one reads the others — so the plan adapts to how you slept, ate and who you&apos;re meeting on Saturday.
          </p>
        </Reveal>
        <MethodTabs />
      </div>
    </section>
  );
}
