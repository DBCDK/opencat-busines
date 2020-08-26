/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.opencat.javascript;

import dk.dbc.opencat.ws.JNDIResources;
import org.perf4j.StopWatch;
import org.perf4j.log4j.Log4JStopWatch;
import org.slf4j.ext.XLogger;
import org.slf4j.ext.XLoggerFactory;
import org.slf4j.profiler.Profiler;

import javax.annotation.PostConstruct;
import javax.ejb.ConcurrencyManagement;
import javax.ejb.ConcurrencyManagementType;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import java.util.Properties;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Singleton pool of ScripterEnvironment's
 * <p>
 * This singleton EJB implements Updates pool of JavaScript engines. Is has methods
 * to take and put engines to the pool.
 * </p>
 * <p>
 * Each environment is created at startup of the application in separate threads. The
 * pool does not wait for the engines to be fully created before it returns control back to
 * the Web Application Server. So it is posible to receive requests before an engine is
 * ready. This will cause the request to wait for an engine, before executing any JavaScript.
 * </p>
 * <p>
 * Basic usage of the EJB will be:
 * <code>
 * <pre>
 *             @EJB
 *             ScripterPool pool;
 *
 *             void f() throws InterruptedException, ScripterException {
 *                    ScripterEnvironment e;
 *                    try {
 *                        e = pool.take();
 *                        e.callMethod("func");
 *                    } finally {
 *                        if (e != null) {
 *                            pool.put( e );
 *                        }
 *                    }
 *              }
 * </pre>
 * </code>
 * Remember handling of exceptions so ypu always put the environment back into the pool.
 * </p>
 */

@Singleton
@Startup
@ConcurrencyManagement(ConcurrencyManagementType.BEAN)
public class ScripterPool {
    private static final XLogger logger = XLoggerFactory.getXLogger(ScripterPool.class);
    private int active_javaScriptPoolSize = 5;

    // Hardcoded Max size of environments
    private final static int MAX_NUMBER_OF_ENVIROMENTS = 100;
    private final static int MIN_NUMBER_OF_ENVIROMENTS = 1;

    // defencive code.. make room for double size of MAX to avoid blocking on put
    private static final BlockingQueue<ScripterEnvironment> environments = new ArrayBlockingQueue(2 * MAX_NUMBER_OF_ENVIROMENTS);

    // replace with atomic int
    private static final AtomicInteger initializedEnvironments = new AtomicInteger();

    private static final AtomicInteger bugxxxx = new AtomicInteger(0);

    private final Properties settings = JNDIResources.getProperties();

    public enum Status {
        ST_NA,
        ST_CREATE_ENVS,
        ST_OK
    }

    public void destroyAllEnvironments() {
        environments.clear();
    }

    /**
     * Constructs engines for a pool in separate threads.
     */
    @PostConstruct
    public void postConstruct() {
        synchronized (bugxxxx) {
            if (bugxxxx.get() > 0) {
                bugxxxx.incrementAndGet();
                logger.warn("Ups.. postConstruct called multiple time on Singleton " + ScripterPool.class.getName() + " .. ignoring");
                return;
            }
        }
        logger.entry();
        logger.debug("Starting creation of javascript environments.");
        int javaScriptPoolSize = Integer.parseInt(settings.getProperty(JNDIResources.JAVASCRIPT_POOL_SIZE));
        if (javaScriptPoolSize < MIN_NUMBER_OF_ENVIROMENTS) {
            javaScriptPoolSize = MIN_NUMBER_OF_ENVIROMENTS;
        }
        if (javaScriptPoolSize > MAX_NUMBER_OF_ENVIROMENTS) {
            javaScriptPoolSize = MAX_NUMBER_OF_ENVIROMENTS;
        }
        logger.info("Pool size: {}", javaScriptPoolSize);
        active_javaScriptPoolSize = javaScriptPoolSize;
        final ScripterEnvironmentFactory scripterEnvironmentFactory = new ScripterEnvironmentFactory();

        logger.info("Started creating {} JS environment(s) ", active_javaScriptPoolSize);
        Profiler profiler = new Profiler("JS init thread");
        for (int i = 0; i < active_javaScriptPoolSize; i++) {
            try {
                profiler.start("JS enviroment " + i);
                ScripterEnvironment scripterEnvironment = scripterEnvironmentFactory.newEnvironment(settings);
                environments.put(scripterEnvironment);
                initializedEnvironments.incrementAndGet();
                logger.info("Environment " + (i + 1) + "/" + active_javaScriptPoolSize + " added to ready queue");
            } catch (Exception e) {
                logger.error("JavaScript environment creation failed ", e);
                e.printStackTrace();
            } finally {
                logger.exit();
            }
        }
        logger.info("JS init thread done:\n{}", profiler.stop());

    }

    /**
     * Retrieves and removes the head of this queue, waiting if necessary until an element becomes available.
     * <p>
     * <b>Description copied from class:</b> {@link java.util.concurrent.LinkedBlockingQueue}
     * </p>
     *
     * @return the head of this pool
     * @throws InterruptedException if interrupted while waiting
     */
    @SuppressWarnings("Duplicates")
    public ScripterEnvironment take() throws InterruptedException {
        logger.entry();
        StopWatch watch = new Log4JStopWatch("javascript.env.take");
        try {
            logger.info("Take environment from queue with size: {}", environments.size());
            return environments.take();
        } finally {
            watch.stop();
            logger.exit();
        }
    }

    /**
     * Inserts the specified element at the tail of this queue, waiting if necessary for
     * space to become available.
     * <p>
     * <b>Description copied from class:</b> {@link java.util.concurrent.LinkedBlockingQueue}
     * </p>
     *
     * @param environment the element to add
     * @throws InterruptedException if interrupted while waiting
     * @throws NullPointerException if the specified element is null
     */
    public void put(ScripterEnvironment environment) throws InterruptedException {
        logger.entry();
        StopWatch watch = new Log4JStopWatch("javascript.env.put");
        try {
            environments.put(environment);
        } finally {
            watch.stop();
            logger.exit();
        }
    }


    /**
     * Return a bool denoting whether all js enviroments has been initialized
     *
     * @return scripterPool startup status
     */
    public Boolean isAllEnviromentsLoaded() {
        logger.entry();
        boolean res = false;
        try {
            return res = initializedEnvironments.intValue() >= Integer.parseInt(System.getenv(JNDIResources.JAVASCRIPT_POOL_SIZE));
        } finally {
            logger.exit(res);
        }
    }


    /**
     * Return scripterPool startup status
     *
     * @return scripterPool startup status
     */
    public Status getStatus() {
        if (initializedEnvironments.intValue() == 0) {
            return Status.ST_NA;
        } else if (initializedEnvironments.intValue() < active_javaScriptPoolSize) {
            return Status.ST_CREATE_ENVS;
        } else {
            return Status.ST_OK;
        }
    }
}