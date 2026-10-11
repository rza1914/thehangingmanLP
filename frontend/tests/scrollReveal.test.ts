import { describe, it, expect, beforeEach, vi } from "vitest";
import { initScrollReveal, __resetRevealedForTests } from "../src/utils/scrollReveal";

type Listener = (entries: Partial<IntersectionObserverEntry>[], observer: MockIntersectionObserver) => void;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: Listener;
  observedElements: Element[] = [];

  constructor(callback: Listener) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element): void {
    this.observedElements.push(el);
  }

  unobserve(el: Element): void {
    this.observedElements = this.observedElements.filter((e) => e !== el);
  }

  disconnect(): void {
    this.observedElements = [];
  }

  trigger(el: Element, isIntersecting: boolean): void {
    this.callback([{ target: el, isIntersecting } as unknown as IntersectionObserverEntry], this);
  }
}

describe("scrollReveal", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    MockIntersectionObserver.instances = [];
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIntersectionObserver;
    __resetRevealedForTests();
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined
    }));
  });

  it("observes [data-reveal] elements and reveals them once they intersect", () => {
    const el = document.createElement("div");
    el.setAttribute("data-reveal", "");
    el.setAttribute("data-reveal-key", "test-1");
    document.body.appendChild(el);

    initScrollReveal(document.body);

    const observerInstance = MockIntersectionObserver.instances[0];
    expect(observerInstance.observedElements).toContain(el);
    expect(el.classList.contains("is-visible")).toBe(false);

    observerInstance.trigger(el, true);
    expect(el.classList.contains("is-visible")).toBe(true);
  });

  it("does not reveal elements that have not intersected yet", () => {
    const el = document.createElement("div");
    el.setAttribute("data-reveal", "");
    el.setAttribute("data-reveal-key", "test-not-yet");
    document.body.appendChild(el);

    initScrollReveal(document.body);

    expect(el.classList.contains("is-visible")).toBe(false);
  });

  it("immediately reveals a key that was already revealed in a previous render, without waiting for intersection", () => {
    const el1 = document.createElement("div");
    el1.setAttribute("data-reveal", "");
    el1.setAttribute("data-reveal-key", "test-2");
    document.body.appendChild(el1);

    initScrollReveal(document.body);
    MockIntersectionObserver.instances[0].trigger(el1, true);
    expect(el1.classList.contains("is-visible")).toBe(true);

    // Simulate a re-render (e.g. a language switch rebuilding the DOM):
    document.body.innerHTML = "";
    const el2 = document.createElement("div");
    el2.setAttribute("data-reveal", "");
    el2.setAttribute("data-reveal-key", "test-2");
    document.body.appendChild(el2);

    initScrollReveal(document.body);
    expect(el2.classList.contains("is-visible")).toBe(true);
  });

  it("reveals all elements immediately when the user prefers reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined
    }));

    const el = document.createElement("div");
    el.setAttribute("data-reveal", "");
    el.setAttribute("data-reveal-key", "test-3");
    document.body.appendChild(el);

    initScrollReveal(document.body);

    expect(el.classList.contains("is-visible")).toBe(true);
    expect(MockIntersectionObserver.instances.length).toBe(0);
  });

  it("does nothing when there are no [data-reveal] elements in root", () => {
    initScrollReveal(document.body);
    expect(MockIntersectionObserver.instances.length).toBe(0);
  });
});